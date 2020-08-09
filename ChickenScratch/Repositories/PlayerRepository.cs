using ChickenScratch.Models;
using System;
using System.Linq;

namespace ChickenScratch.Repositories
{
    public class PlayerRepository : GenericKeyRepositoryBase<Guid, Player>
    {
        public bool TryGetByConnectionId(Guid connectionId, out Player player)
        {
            player = GetAll().SingleOrDefault(p => p.ConnectionId == connectionId);
            return player != null;
        }
    }
}
