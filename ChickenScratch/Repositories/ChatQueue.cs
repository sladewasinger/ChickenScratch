using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace ChickenScratch.Repositories
{
    public class ChatQueue
    {
        private ConcurrentQueue<string> chatLog = new ConcurrentQueue<string>();
        int chatLogSize = 0;
        int chatLogMaxSize = 100;

        public List<string> GetChatLog()
        {
            return chatLog.ToList();
        }

        public void LogChatMessage(string msg)
        {
            chatLog.Enqueue(msg);
            chatLogSize++;
            while (chatLogSize > chatLogMaxSize)
            {
                if (chatLog.TryDequeue(out _))
                {
                    chatLogSize--;
                }
            }
        }
    }
}
