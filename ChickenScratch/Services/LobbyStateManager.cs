using ChickenScratch.Hubs;
using ChickenScratch.Models;
using ChickenScratch.Repositories;
using HubSockets;
using System;
using System.Linq;
using System.Threading.Tasks;

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

        public async Task PlayerDisconnected(HubSocketContext context, HubSocketClients clients)
        {
            var lobby = lobbyRepository.GetAll().SingleOrDefault(x => x.Players.Any(p => p.ConnectionId == context.ConnectionId));
            if (lobby != null)
            {
                var player = lobby.Players.SingleOrDefault(p => p.ConnectionId == context.ConnectionId);
                lobby.Players.Remove(player);

                if (!lobby.Players.Any())
                {
                    lobbyRepository.TryRemove(lobby.ID, out _);
                }
                else
                {
                    lobbyRepository.AddOrUpdate(lobby.ID, lobby);
                }

                var gamePlayer = lobby.Engine?.GetGamePlayer(player.ID);
                if (gamePlayer != null)
                {
                    lobby.Engine.PlayerLeft(lobby.Engine.GetGamePlayer(player.ID));
                }
                await clients.SendAllExcept("LobbyStateUpdated", context.ConnectionId, GetState());
            }
        }
    }
}
