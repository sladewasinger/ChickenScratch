using ChickenScratch.Models;
using ChickenScratch.Repositories;
using ChickenScratch.Services;
using HubSockets;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace ChickenScratch.Hubs
{
    public partial class GameManager
    {
        private MethodInfo[] gameMethods;

        private readonly LobbyStateManager lobbyStateManager;
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;

        public GameManager(LobbyStateManager lobbyStateManager, LobbyRepository lobbyRepository, PlayerRepository playerRepository)
        {
            gameMethods = typeof(GameLogic).GetMethods();

            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<HubResponse> CallMethod(string methodName, HubSocketContext context, HubSocketClients clients, params object[] methodParameters)
        {
            var gameMethod = gameMethods.SingleOrDefault(x => x.Name.ToUpper() == methodName.ToUpper());
            if (gameMethod == null)
            {
                return HubResponse.Error($"Could not find method with name '{methodName}'.");
            }

            Player player = null;
            Lobby lobby = null;

            bool needsPlayer = gameMethod.GetCustomAttribute(typeof(NeedsPlayerAttribute)) != null;
            bool playerCannotBeInALobby = gameMethod.GetCustomAttribute(typeof(PlayerCannotBeInALobbyAttribute)) != null;
            if (needsPlayer || playerCannotBeInALobby)
            {
                if (!playerRepository.TryGetByConnectionId(context.ConnectionId, out player))
                {
                    return HubResponse.Error("Can't find player associated with this connectionId.");
                }

                if (playerCannotBeInALobby)
                {
                    if (lobbyRepository.GetAll().Any(l => l.Players.Any(p => p.ID == player.ID)))
                    {
                        return HubResponse
                            .Error($"Player '{player.Name} - {player.ID}' is already in a lobby.");
                    }
                }
            }

            GameLogic gameLogic = new GameLogic(
                context,
                clients,
                lobbyStateManager,
                lobbyRepository,
                playerRepository,
                player,
                lobby);

            Task<HubResponse> task = (Task<HubResponse>)gameMethod.Invoke(gameLogic, methodParameters);
            HubResponse returnResult = await task;

            return returnResult;
        }

        public class NeedsPlayerAttribute : Attribute { }
        public class PlayerCannotBeInALobbyAttribute : Attribute { }
        public class NeedsPlayerInLobby : Attribute { }
    }
}
