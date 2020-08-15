using ChickenScratch.Models;
using ChickenScratch.Repositories;
using System;
using System.Linq;

namespace ChickenScratch.Services
{
    public class LobbyStateManager
    {
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;

        public LobbyStateManager(LobbyRepository lobbyRepository, PlayerRepository playerRepository)
        {
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public LobbyState GetState()
        {
            LobbyState lobbyState = new LobbyState()
            {
                Lobbies = lobbyRepository.GetAll().ToList(),
                Players = playerRepository.GetAll().ToList()
            };

            return lobbyState;
        }
    }
}
