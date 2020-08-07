namespace ChickenScratch.HubSockets
{
    public interface IHub
    {
        void OnConnected();
        void OnDisconnected();
    }
}