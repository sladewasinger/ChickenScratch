using System;

namespace WebSocketServer
{
    public class WebSocketDataArgs : EventArgs
    {
        public string Data { get; set; }
        public WSocket WSocket { get; set; }
    }
}
