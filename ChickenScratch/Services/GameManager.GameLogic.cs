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
    public partial class GameManager
    {
        private class GameLogic
        {
            private readonly HubSocketContext Context;
            private readonly HubSocketClients Clients;
            private readonly Player player;
            private readonly Lobby lobby;

            private readonly LobbyStateManager lobbyStateManager;
            private readonly LobbyRepository lobbyRepository;
            private readonly PlayerRepository playerRepository;

            public GameLogic(
                HubSocketContext context,
                HubSocketClients clients,
                LobbyStateManager lobbyStateManager,
                LobbyRepository lobbyRepository,
                PlayerRepository playerRepository,
                Player player,
                Lobby lobby)
            {
                Context = context ?? throw new ArgumentNullException(nameof(context));
                Clients = clients ?? throw new ArgumentNullException(nameof(clients));
                this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
                this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
                this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
                this.player = player;
                this.lobby = lobby;
            }

            [NeedsPlayer, PlayerCannotBeInALobby]
            public async Task<HubResponse> JoinLobby(string lobbyKey)
            {
                if (!lobbyRepository.TryGetByLobbyKey(lobbyKey, out Lobby lobby))
                {
                    return HubResponse
                        .Error($"Could not find lobby with key: '{lobbyKey}'.");
                }
                if (lobby.GameRunning)
                {
                    return HubResponse
                        .Error($"Game is already running! Cannot join!");
                }

                lobby.Players.Add(player);
                lobbyRepository.AddOrUpdate(lobby.ID, lobby);

                await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());
                return HubResponse<LobbyState>.Success(lobbyStateManager.GetState());
            }

            [NeedsPlayer, PlayerCannotBeInALobby]
            public async Task<HubResponse> CreateLobby(string lobbyName)
            {
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
        }
    }
}
