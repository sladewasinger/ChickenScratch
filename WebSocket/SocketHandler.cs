using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public class SocketHandler
    {
        public const int BufferSize = 4096;

        public readonly Guid ID = Guid.NewGuid();
        readonly WebSocket socket;

        SocketHandler(WebSocket socket)
        {
            this.socket = socket;
            SocketsManager.AddSocket(ID, socket);
        }

        async Task EchoLoop()
        {
            var buffer = new byte[BufferSize];
            var seg = new ArraySegment<byte>(buffer);

            while (socket.State == WebSocketState.Open)
            {
                var incoming = await socket.ReceiveAsync(seg, CancellationToken.None);
                string txt = $"From {ID}: {Encoding.UTF8.GetString(seg)}";

                byte[] outgoingBytes = new byte[BufferSize];
                Array.Copy(Encoding.UTF8.GetBytes(txt), outgoingBytes, BufferSize);
                var outgoing = new ArraySegment<byte>(outgoingBytes, 0, outgoingBytes.Length);
                await SocketsManager.SendAll(outgoing);
            }

            SocketsManager.RemoveSocket(ID);
        }

        static async Task Acceptor(HttpContext hc, Func<Task> n)
        {
            if (!hc.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var socket = await hc.WebSockets.AcceptWebSocketAsync();
            var h = new SocketHandler(socket);
            await h.EchoLoop();
        }

        public static void Map(IApplicationBuilder app)
        {
            app.UseWebSockets();
            app.Use(Acceptor);
        }
    }
}
