﻿using ChickenScratch.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ChickenScratch.Models
{
    public class Lobby
    {
        public string Name { get; set; }
        public Guid ID { get; set; }
        public List<Player> Players { get; set; }
        public string Key { get; private set; }

        public Lobby()
        {
            Key = GenerateKey();
        }

        private string GenerateKey()
        {
            var random = new Random("seed".GetHashCode());
            char[] letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();
            return new string(Enumerable.Repeat(letters, 4).Select(s => s[random.Next(0, letters.Length)]).ToArray());
        }
    }
}
