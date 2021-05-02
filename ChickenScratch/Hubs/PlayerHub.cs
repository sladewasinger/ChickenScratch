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
        private readonly GameLogicInvoker gameManager;

        public PlayerHub(LobbyStateManager lobbyStateManager, PlayerRepository playerRepository, GameLogicInvoker gameManager)
        {
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            this.gameManager = gameManager ?? throw new ArgumentNullException(nameof(gameManager));
        }

        public async Task<HubResponse> CreatePlayer(string playerName)
        {
            return await gameManager.CallMethod(nameof(CreatePlayer), Context, Clients, playerName);
        }

        public HubResponse GetTotalPlayerCount()
        {
            return HubResponse<int>.Success(playerRepository.Count());
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
