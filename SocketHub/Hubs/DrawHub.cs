using WebSocketServer.Repositories;

namespace WebSocketServer.Hubs
{
    public class DrawHub : Hub
    {
        private readonly ImageRepository imageRepository;
        private readonly SocketHandler socketHandler;

        public DrawHub(ImageRepository imageRepository, SocketHandler socketHandler)
        {
            this.imageRepository = imageRepository;
            this.socketHandler = socketHandler;
        }

        public async void Draw()
        {
            if (imageRepository.TryGet("test123", out string imageBase64))
            {
                await socketHandler.SendAllExcept(ConnectionId, imageBase64);
            }
        }
    }
}
