using System;

namespace ChickenScratch.HubSockets
{
    public class HubSocketContext
    {
        public HubSocket HubSocket { get; set; }
        public Guid ConnectionId => HubSocket.ID;

        public HubSocketContext( HubSocket hubSocket)
        {
            HubSocket = hubSocket ?? throw new ArgumentNullException(nameof(hubSocket));
        }
    }
}