using ChickenScratch.Models;
using System;
using System.Linq;

namespace ChickenScratch.Repositories
{
    public class LobbyRepository : GenericKeyRepositoryBase<Guid, Lobby>
    {
        public bool TryGetByLobbyKey(string lobbyKey, out Lobby lobby)
        {
            lobby = GetAll().SingleOrDefault(x => x.Key == lobbyKey);
            return lobby != null;
        }
    }
}
