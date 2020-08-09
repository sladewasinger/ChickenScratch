using ChickenScratch.HubSockets;
using ChickenScratch.Models;
using ChickenScratch.Repositories;
using System;
using System.Threading.Tasks;

namespace ChickenScratch.Hubs
{
    public class PlayerHub : Hub
    {
        private readonly PlayerRepository playerRepository;

        public PlayerHub(PlayerRepository playerRepository)
        {
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<RegisterPlayerResponse> CreatePlayer(string playerName)
        {
            if (playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player existingPlayer))
            {
                return RegisterPlayerResponse
                    .Error($"A player already exists for this connectionId with name '{existingPlayer.Name}'");
            }

            var player = new Player()
            {
                Name = playerName,
                ConnectionId = Context.ConnectionId,
                ID = Guid.NewGuid()
            };

            playerRepository.AddOrUpdate(player.ID, player);

            await Clients.SendAllExcept("PlayerCreated", Context.ConnectionId, player);

            return RegisterPlayerResponse.Success(player);
        }
    }
}
