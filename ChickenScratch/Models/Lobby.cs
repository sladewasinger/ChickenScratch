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
            Key = GenerateKey();
        }

        private string GenerateKey()
        {
            char[] letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray();
            return new string(Enumerable.Repeat(letters, 4).Select(s => s[StaticRandom.Random.Next(0, letters.Length)]).ToArray());
        }
    }
}
