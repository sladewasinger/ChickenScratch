using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public class HubData
    {
        public string MethodName { get; set; }
        public object Data { get; set; }
    }
}
