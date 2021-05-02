using ChickenScratch.Extensions;
using ChickenScratchEngine;
using ChickenScratchEngine.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ChickenScratch.Models
{
    public class Lobby
    {
        public string Name { get; set; }
        public Guid ID { get; set; }
        public Player LobbyLeader => Players.FirstOrDefault();
        public List<Player> Players { get; set; }
        public string Key { get; private set; }
        public GameEngine Engine { get; set; }
        public bool GameRunning => Engine != null;

        public Lobby()
        {
            Key = LobbyExtensions.GenerateKey();
        }
    }
}
