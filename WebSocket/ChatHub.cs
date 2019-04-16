using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public class ChatHub : Hub
    {
        public void TestMethodABC(ChatMessage data)
        {
            var a = data;
        }
    }
}
