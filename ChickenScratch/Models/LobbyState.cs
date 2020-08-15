using System.Collections.Generic;

namespace ChickenScratch.Models
{
    public class LobbyState
    {
        public List<Lobby> Lobbies { get; set; }
        public List<Player> Players { get; set; }
    }
}
