using ChickenScratch.Models;
using ChickenScratch.Repositories;
using ChickenScratch.Services;
using HubSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChickenScratch.Hubs
{
    public class LobbyHub : Hub
    {
        private readonly LobbyStateManager lobbyStateManager;
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;

        public LobbyHub(LobbyStateManager lobbyStateManager, LobbyRepository lobbyRepository, PlayerRepository playerRepository)
        {
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        // TODO: Extract all logic (and error handling?) to lobby state manager.
        //      combine PlayerHub & LobbyHub logic into lobby state manager. Will make life so much easier.
        public async Task<HubResponse> CreateLobby(string lobbyName)
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return HubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }

            if (lobbyRepository.GetAll().Any(l => l.Players.Any(p => p.ID == player.ID)))
            {
                return HubResponse
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

            await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());
            return HubResponse<LobbyState>.Success(lobbyStateManager.GetState());
        }

        public async Task<HubResponse> JoinLobby(string lobbyKey)
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return HubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }

            if (lobbyRepository.GetAll().Any(l => l.Players.Any(p => p.ID == player.ID)))
            {
                return HubResponse
                    .Error($"Player '{player.Name} - {player.ID}' is already in a lobby.");
            }

            if (!lobbyRepository.TryGetByLobbyKey(lobbyKey, out Lobby lobby))
            {
                return HubResponse
                    .Error($"Could not find lobby with key: '{lobbyKey}'.");
            }

            lobby.Players.Add(player);
            lobbyRepository.AddOrUpdate(lobby.ID, lobby);

            await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());
            return HubResponse<LobbyState>.Success(lobbyStateManager.GetState());
        }

        public async override void OnDisconnectedAsync()
        {
            var lobbyContainingPlayer = lobbyRepository.GetAll().SingleOrDefault(x => x.Players.Any(p => p.ConnectionId == Context.ConnectionId));
            if (lobbyContainingPlayer != null)
            {
                var player = lobbyContainingPlayer.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                lobbyContainingPlayer.Players.Remove(player);
                if (!lobbyContainingPlayer.Players.Any())
                {
                    lobbyRepository.TryRemove(lobbyContainingPlayer.ID, out _);
                }
                else
                {
                    lobbyRepository.AddOrUpdate(lobbyContainingPlayer.ID, lobbyContainingPlayer);
                }
                await Clients.SendAllExcept("LobbyStateUpdated", Context.ConnectionId, lobbyStateManager.GetState());
            }
            base.OnDisconnectedAsync();
        }
    }
}
