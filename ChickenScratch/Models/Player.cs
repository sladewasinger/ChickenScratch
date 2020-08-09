using System;

namespace ChickenScratch.Models
{
    public class Player
    {
        public string Name { get; set; }
        public Guid ID { get; set; }
        public Guid ConnectionId { get; set; }
    }
}
