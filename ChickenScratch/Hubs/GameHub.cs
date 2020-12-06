using ChickenScratch.Game;
using ChickenScratch.Models;
using ChickenScratch.Repositories;
using ChickenScratch.Services;
using HubSockets;
using System;
using System.Threading.Tasks;

namespace ChickenScratch.Hubs
{
    public class GameHub : Hub
    {
        private readonly LobbyStateManager lobbyStateManager;
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;

        public GameHub(LobbyStateManager lobbyStateManager, LobbyRepository lobbyRepository, PlayerRepository playerRepository)
        {
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<HubResponse> StartGame()
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return HubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }
            if (!lobbyRepository.TryGetByPlayer(player, out Lobby lobby))
            {
                return HubResponse
                    .Error($"Could not find lobby that contains player: '{player.Name}'.");
            }
            if (lobby.Engine != null)
            {
                return HubResponse
                    .Error("Lobby already has a game in progress.");

            }

            GameEngine engine = new GameEngine();
            lobby.Engine = engine;

            engine.GameStateUpdated += (o, e) => OnGameStateUpdated(lobby);
            engine.StartGame(lobby);

            lobbyRepository.AddOrUpdate(lobby.ID, lobby);
            
            await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());

            var gameState = engine.GetGameStateForPlayer(engine.GetGamePlayer(player));
            return HubResponse<GameState>.Success(gameState);
        }

        public HubResponse GetGameState()
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return HubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }
            if (!lobbyRepository.TryGetByPlayer(player, out Lobby lobby))
            {
                return HubResponse
                    .Error($"Could not find lobby that contains player: '{player.Name}'.");
            }
            if (lobby.Engine == null)
            {
                return HubResponse
                    .Error("Lobby does not have an engine.");

            }

            var gameState = lobby.Engine.GetGameStateForPlayer(lobby.Engine.GetGamePlayer(player));
            return HubResponse<GameState>.Success(gameState);
        }

        private async void OnGameStateUpdated(Lobby lobby)
        {
            foreach(var player in lobby.Players)
            {
                var gameState = lobby.Engine.GetGameStateForPlayer(lobby.Engine.GetGamePlayer(player));
                await Clients.SendToClient("GameStateUpdated", player.ConnectionId, gameState);
            }
        }
    }
}
