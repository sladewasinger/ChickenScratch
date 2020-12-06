using ChickenScratch.Game;
using System.Collections.Generic;

namespace ChickenScratch.Models
{
    public class GameState
    {
        public List<GamePlayer> Players { get; set; }
        public GamePlayer ActivePlayer { get; set; }
        public string CurrentWord { get; set; }
    }
}
