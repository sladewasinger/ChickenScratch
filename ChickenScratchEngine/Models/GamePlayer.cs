using System;

namespace ChickenScratchEngine.Models
{
    public class GamePlayer
    {
        internal GamePlayer() { }

        public string Name { get; set; }
        public Guid ID { get; set; }
        public Guid ConnectionId { get; set; }
        public int Score { get; set; }
        public bool HasGuessedCorrectly { get; set; }
    }
}
