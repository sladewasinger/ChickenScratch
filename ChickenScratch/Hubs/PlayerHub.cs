using ChickenScratch.Models;
using ChickenScratch.Repositories;
using ChickenScratch.Services;
using HubSockets;
using System;
using System.Threading.Tasks;

namespace ChickenScratch.Hubs
{
    public class PlayerHub : Hub
    {
        private readonly LobbyStateManager lobbyStateManager;
        private readonly PlayerRepository playerRepository;

        public PlayerHub(LobbyStateManager lobbyStateManager, PlayerRepository playerRepository)
        {
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<HubResponse> CreatePlayer(string playerName)
        {
            if (playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player existingPlayer))
            {
                return HubResponse
                    .Error($"A player already exists for this connectionId with name '{existingPlayer.Name}'");
            }

            var player = new Player()
            {
                Name = playerName,
                ConnectionId = Context.ConnectionId,
                ID = Guid.NewGuid()
            };

            playerRepository.AddOrUpdate(player.ID, player);

            await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());
            return HubResponse<Player>.Success(player);
        }

        public async override void OnDisconnectedAsync()
        {
            if (playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player existingPlayer))
            {
                playerRepository.TryRemove(existingPlayer.ID, out _);
                await Clients.SendAllExcept("LobbyStateUpdated", Context.ConnectionId, lobbyStateManager.GetState());
            }
            base.OnDisconnectedAsync();
        }
    }
}
