using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using static WebSocketServer.WSocket;

namespace WebSocketServer
{
    public static class SocketManager
    {
        static ConcurrentDictionary<Guid, WSocket> webSockets = new ConcurrentDictionary<Guid, WSocket>();

        public static async Task AddSocket(WSocket webSocket)
        {
            webSockets.TryAdd(webSocket.ID, webSocket);
            webSocket.DataReceived += DataReceived;
            await webSocket.ListenLoop();
        }

        public static void RemoveSocket(Guid id)
        {
            webSockets.TryRemove(id, out WSocket removedSocket);
        }

        public static async void DataReceived(object sender, EventArgs e)
        {
            if (!(e is DataArgs dataArgs))
            {
                return;
            }

            await Echo(dataArgs.WSocket, dataArgs.Data);
        }

        public static async Task Echo(WSocket wSocket, string data)
        {
            await SendAll($"[ID: {wSocket.ID}]: {data}");
        }

        public static async Task SendAll(string data)
        {
            foreach(var socket in webSockets.Values)
            {
                await socket.SendData(data);
            }
        }
    }
}
