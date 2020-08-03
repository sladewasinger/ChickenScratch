using ChickenScratch.HubSockets;
using ChickenScratch.Repositories;

namespace ChickenScratch.Hubs
{
    public class DrawHub : Hub
    {
        private readonly ImageRepository imageRepository;
        private readonly HubSocketDispatcher socketDispatcher;

        public DrawHub(ImageRepository imageRepository, HubSocketDispatcher socketDispatcher)
        {
            this.imageRepository = imageRepository ?? throw new System.ArgumentNullException(nameof(imageRepository));
            this.socketDispatcher = socketDispatcher ?? throw new System.ArgumentNullException(nameof(socketDispatcher));
        }

        public async void Draw()
        {
            if (imageRepository.TryGet("test123", out string imageBase64))
            {
                await socketDispatcher.SendAllExcept(ConnectionId, imageBase64);
            }
        }
    }
}
