using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public static class SocketsManager
    {
        static ConcurrentDictionary<Guid, WebSocket> webSockets = new ConcurrentDictionary<Guid, WebSocket>();

        public static void AddSocket(Guid id, WebSocket webSocket)
        {
            webSockets.TryAdd(id, webSocket);
        }

        public static void RemoveSocket(Guid id)
        {
            webSockets.TryRemove(id, out WebSocket removedSocket);
        }

        public static async Task<bool> SendAll(ArraySegment<byte> outgoing)
        {
            foreach(var socket in webSockets.Values)
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(outgoing, WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }

            return true;
        }
    }
}
