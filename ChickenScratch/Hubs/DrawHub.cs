using ChickenScratch.Repositories;
using HubSockets;
using System.Threading.Tasks;

namespace ChickenScratch.Hubs
{
    public class DrawHub : Hub
    {
        private readonly GameManager gameManager;

        public DrawHub(GameManager gameManager)
        {
            this.gameManager = gameManager ?? throw new System.ArgumentNullException(nameof(gameManager));
        }

        public async Task<HubResponse> Draw(string imageBase64)
        {
            return await gameManager.CallMethod(nameof(Draw), Context, Clients, imageBase64);
        }

        public async Task<HubResponse> Clear()
        {
            return await gameManager.CallMethod(nameof(Clear), Context, Clients);
        }
    }
}
