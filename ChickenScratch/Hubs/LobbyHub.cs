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
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return LobbyCreateHubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }

            if (lobbyRepository.GetAll().Any(l => l.Players.Any(p => p.ID == player.ID)))
            {
                return LobbyCreateHubResponse
                    .Error($"Player '{player.Name} - {player.ID}' is already in a lobby.");
            }

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

        public async Task<LobbyJoinResponse> JoinLobby(string lobbyKey)
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return LobbyJoinResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }

            if (lobbyRepository.GetAll().Any(l => l.Players.Any(p => p.ID == player.ID)))
            {
                return LobbyJoinResponse
                    .Error($"Player '{player.Name} - {player.ID}' is already in a lobby.");
            }

            if (!lobbyRepository.TryGetByLobbyKey(lobbyKey, out Lobby lobby))
            {
                return LobbyJoinResponse
                    .Error($"Could not find lobby with key: '{lobbyKey}'.");
            }

            lobby.Players.Add(player);
            lobbyRepository.AddOrUpdate(lobby.ID, lobby);

            await Clients.SendToClients("PlayerJoinedLobby", lobby.Players
                .Where(x => x.ConnectionId != Context.ConnectionId)
                .Select(x => x.ConnectionId), lobby);

            return LobbyJoinResponse.Success(lobby);
        }
    }
}
