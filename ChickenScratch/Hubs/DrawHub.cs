using ChickenScratch.HubSockets;
using ChickenScratch.Repositories;

namespace ChickenScratch.Hubs
{
    public class DrawHub : Hub
    {
        private readonly ImageRepository imageRepository;

        public DrawHub(ImageRepository imageRepository)
        {
            this.imageRepository = imageRepository ?? throw new System.ArgumentNullException(nameof(imageRepository));
        }

        public async void Draw(string imageBase64)
        {
                await Clients.SendAllExcept("Draw", Context.ConnectionId, imageBase64);
        }
    }
}
