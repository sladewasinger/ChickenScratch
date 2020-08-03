using System;

namespace ChickenScratch
{
    public class Hub : IHub
    {
        public Guid ConnectionId;

        public Hub() { }

        public virtual void OnConnected()
        {

        }

        public virtual void OnDisconnected()
        {

        }
    }
}
