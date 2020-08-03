using System;

namespace ChickenScratch
{
    public class Hub : IHub
    {
        public readonly Guid ConnectionId;

        public Hub() { }

        public virtual void OnConnected()
        {

        }

        public virtual void OnDisconnected()
        {

        }
    }
}
