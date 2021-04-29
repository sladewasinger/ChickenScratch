using ChickenScratch.Hubs;
using ChickenScratch.Repositories;
using HubSockets;
using System;
using System.Threading.Tasks;

namespace ChickenScratch.Services
{
    public partial class LobbyHub : Hub
    {
        private readonly LobbyStateManager lobbyStateManager;
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;
        private readonly GameManager gameManager;

        public LobbyHub(LobbyStateManager lobbyStateManager, LobbyRepository lobbyRepository, PlayerRepository playerRepository, GameManager gameManager)
        {
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            this.gameManager = gameManager ?? throw new ArgumentNullException(nameof(gameManager));
        }

        public async Task<HubResponse> CreateLobby(string lobbyName)
        {
            return await gameManager.CallMethod(nameof(CreateLobby), Context, Clients, lobbyName);
        }

        public async Task<HubResponse> JoinLobby(string lobbyKey)
        {
            return await gameManager.CallMethod(nameof(JoinLobby), Context, Clients, lobbyKey);
        }

        public async override void OnDisconnectedAsync()
        {
            await lobbyStateManager.PlayerDisconnected(Context, Clients);
            base.OnDisconnectedAsync();
        }
    }
}
