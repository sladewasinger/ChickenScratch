using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ChickenScratch
{
    public class WSocket
    {
        public Guid ID { get; set; }

        private const int BufferSize = 4028;
        private WebSocket _socket;

        public event EventHandler DataReceived;

        protected virtual void OnDataReceived(WebSocketDataArgs e)
        {
            EventHandler handler = DataReceived;
            handler?.Invoke(this, e);
        }

        public WSocket(Guid id, WebSocket socket)
        {
            ID = id;
            _socket = socket;
        }

        public async Task ListenLoop()
        {
            var buffer = new byte[BufferSize];
            var seg = new ArraySegment<byte>(buffer);

            while (true)
            {
                var incoming = await _socket.ReceiveAsync(seg, CancellationToken.None);
                if (_socket.State != WebSocketState.Open)
                    break;
                OnDataReceived(new WebSocketDataArgs() { Data = Encoding.UTF8.GetString(seg), WSocket = this });
            }

            // SocketHub.RemoveSocket(ID);
            // Moved to SocketHandler ^
        }

        public async Task SendData(string data)
        {
            if (_socket.State == WebSocketState.Open)
            {
                byte[] outgoingBytes = Encoding.UTF8.GetBytes(data);
                //Array.Copy(Encoding.UTF8.GetBytes(data), outgoingBytes, BufferSize);
                var outgoing = new ArraySegment<byte>(outgoingBytes, 0, outgoingBytes.Length);
                await _socket.SendAsync(outgoing, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }
}
