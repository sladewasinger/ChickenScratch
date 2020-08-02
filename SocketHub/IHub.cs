namespace WebSocketServer
{
    public interface IHub
    {
        void OnConnected();
        void OnDisconnected();
    }
}