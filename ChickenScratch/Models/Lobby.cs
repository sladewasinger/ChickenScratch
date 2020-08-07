using System;
using System.Collections.Generic;

namespace ChickenScratch.Models
{
    public class Lobby
    {
        public string Name { get; set; }
        public Guid ID { get; set; }
        public List<Player> Players { get; set; }
    }
}