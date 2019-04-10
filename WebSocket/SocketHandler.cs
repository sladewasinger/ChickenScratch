using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public class SocketHandler
    {
        public const int BufferSize = 4096;
        readonly WebSocket socket;

        SocketHandler(WebSocket socket)
        {
            this.socket = socket;
        }

        async Task EchoLoop()
        {
            var buffer = new byte[BufferSize];
            var seg = new ArraySegment<byte>(buffer);

            while (socket.State == WebSocketState.Open)
            {
                var incoming = await this.socket.ReceiveAsync(seg, CancellationToken.None);
                var outgoing = new ArraySegment<byte>(buffer, 0, incoming.Count);
                await socket.SendAsync(outgoing, WebSocketMessageType.Text, true, CancellationToken.None);
            }
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
