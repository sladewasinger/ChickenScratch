using System;

namespace ChickenScratch.HubSockets
{
    public class HubSocketEventArgs : EventArgs
    {
        public string Data { get; set; }
        public HubSocket HubSocket { get; set; }
    }
}
