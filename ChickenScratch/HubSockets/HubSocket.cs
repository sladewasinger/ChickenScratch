using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ChickenScratch
{
    public class HubSocket : IDisposable
    {
        public Guid ID { get; set; }

        private const int BufferSize = 4028;
        private WebSocket _socket;

        public event EventHandler DataReceived;

        protected virtual void OnDataReceived(HubSocketEventArgs e)
        {
            DataReceived?.Invoke(this, e);
        }

        public HubSocket(Guid id, WebSocket socket)
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
                await _socket.ReceiveAsync(seg, CancellationToken.None);
                if (_socket.State != WebSocketState.Open)
                    break;
                OnDataReceived(new HubSocketEventArgs() { Data = Encoding.UTF8.GetString(seg), WSocket = this });
            }
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
            else
            {
                throw new Exception("Attempted to send data but the unerlying socket is not open!");
            }
        }

        public void Dispose()
        {
            _socket.Dispose();
        }
    }
}
