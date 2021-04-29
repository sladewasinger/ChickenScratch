using ChickenScratch.Models;
using ChickenScratch.Repositories;
using ChickenScratch.Services;
using ChickenScratchEngine;
using ChickenScratchEngine.Models;
using HubSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ChickenScratchEngine.GameEngine;

namespace ChickenScratch.Hubs
{
    public class GameHub : Hub
    {
        private readonly GameManager gameManager;
        private readonly LobbyStateManager lobbyStateManager;
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;

        public GameHub(GameManager gameManager, LobbyStateManager lobbyStateManager, LobbyRepository lobbyRepository, PlayerRepository playerRepository)
        {
            this.gameManager = gameManager ?? throw new ArgumentNullException(nameof(gameManager));
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<HubResponse> StartGame()
        {
            return await gameManager.CallMethod(nameof(StartGame), Context, Clients);
        }

        public async Task<HubResponse> Guess(string guess)
        {
            return await gameManager.CallMethod(nameof(Guess), Context, Clients, guess);
        }

        public async Task<HubResponse> GetGameState()
        {
            return await gameManager.CallMethod(nameof(GetGameState), Context, Clients);
        }
    }
}
