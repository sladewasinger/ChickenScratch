﻿using ChickenScratch.Models;
using HubSockets;
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

        public bool TryGetByPlayer(Player player, out Lobby lobby)
        {
            lobby = GetAll().SingleOrDefault(x => x.Players.Any(p => p.ID == player.ID));
            return lobby != null;
        }
    }
}
