using System;
using System.Collections.Generic;

namespace ChickenScratchEngine.Models
{
    public class GameState
    {
        public List<GamePlayer> Players { get; set; }
        public GamePlayer ActivePlayer { get; set; }
        public string CurrentWord { get; set; }
        public bool StartOfNewRound { get; set; }
        public DateTime TimeOfRoundEnd { get; set; }
    }
}
