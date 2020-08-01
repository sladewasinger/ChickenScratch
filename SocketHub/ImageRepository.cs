using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebSocketServer
{
    public static class ImageRepository
    {
        public static ConcurrentStack<string> ImageBag = new ConcurrentStack<string>();
    }
}
