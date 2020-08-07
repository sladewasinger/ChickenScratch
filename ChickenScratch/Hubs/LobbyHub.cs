using ChickenScratch.HubSockets;
using ChickenScratch.Models;
using ChickenScratch.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChickenScratch.Hubs
{
    public class LobbyHub : Hub
    {
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;

        public LobbyHub(LobbyRepository lobbyRepository, PlayerRepository playerRepository)
        {
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<LobbyCreateHubResponse> CreateLobby(string lobbyName)
        {
            //if(!playerRepository.TryGet(Context.ConnectionId, out Player player))
            //{
            //    return LobbyCreateHubResponse
            //        .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            //}

            //if (lobbyRepository.GetAll().Any(l => l.Players.Any(p => p.ID == player.ID)))
            //{
            //    return LobbyCreateHubResponse
            //        .Error($"Player '{player.Name} - {player.ID}' is already in a lobby.");
            //}

            var player = new Player()
            {
                ID = Guid.NewGuid(),
                Name = "Player" + DateTime.UtcNow.ToShortTimeString()
            };

            var lobby = new Lobby()
            {
                ID = Guid.NewGuid(),
                Name = lobbyName,
                Players = new List<Player>()
                {
                    player
                }
            };
            lobbyRepository.AddOrUpdate(lobby.ID, lobby);

            await Clients.SendAllExcept("LobbyCreated", Context.ConnectionId, lobby);

            return LobbyCreateHubResponse.Success(lobby);
        }
    }
}
