using ChickenScratch.HubSockets;

namespace ChickenScratch.HubSockets
{
    public class Hub : IHub
    {
        public HubSocketClients Clients { get; set; }
        public HubSocketContext Context { get; set; }

        public Hub() { }

        public virtual void OnConnected()
        {

        }

        public virtual void OnDisconnected()
        {

        }
    }
}
