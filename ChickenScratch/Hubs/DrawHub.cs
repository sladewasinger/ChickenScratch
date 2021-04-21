using ChickenScratch.Repositories;
using HubSockets;

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
            // await Clients.SendAllExcept("Draw", Context.ConnectionId, imageBase64);
            // TODO: Add server-side validation for player's turn.
            await Clients.SendAll("Draw", imageBase64);
        }

        public async void Clear()
        {
            // TODO: Add server-side validation for player's turn.
            await Clients.SendAll("Clear", string.Empty);
        }
    }
}
