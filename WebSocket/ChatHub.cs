using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public class ChatHub : Hub
    {
        public async void TestMethodABC(ChatMessage data)
        {
            var a = data;
            await SocketHub.SendAll(data);        
        }
    }
}
