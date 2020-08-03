using System;

namespace ChickenScratch
{
    public class HubSocketEventArgs : EventArgs
    {
        public string Data { get; set; }
        public HubSocket WSocket { get; set; }
    }
}
