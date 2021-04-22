using ChickenScratch.Models;
using ChickenScratch.Repositories;
using ChickenScratch.Services;
using ChickenScratchEngine;
using ChickenScratchEngine.Models;
using HubSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ChickenScratchEngine.GameEngine;

namespace ChickenScratch.Hubs
{
    public class GameHub : Hub
    {
        private readonly LobbyStateManager lobbyStateManager;
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;

        public GameHub(LobbyStateManager lobbyStateManager, LobbyRepository lobbyRepository, PlayerRepository playerRepository)
        {
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<HubResponse> StartGame()
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return HubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }
            if (!lobbyRepository.TryGetByPlayer(player, out Lobby lobby))
            {
                return HubResponse
                    .Error($"Could not find lobby that contains player: '{player.Name}'.");
            }
            if (lobby.Engine != null)
            {
                return HubResponse
                    .Error("Lobby already has a game in progress.");

            }

            GameEngine engine = new GameEngine();
            lobby.Engine = engine;

            engine.GameStateUpdated += (o, e) => OnGameStateUpdated(lobby, e);
            List<GamePlayer> players = lobby.Players.Select(p => engine.CreateGamePlayer(p.Name, p.ID)).ToList();
            engine.StartGame(players);

            lobbyRepository.AddOrUpdate(lobby.ID, lobby);

            await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());

            var gameState = engine.GetGameStateForPlayer(engine.GetGamePlayer(player.ID));
            return HubResponse<GameState>.Success(gameState);
        }

        public HubResponse Guess(string guess)
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return HubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }
            if (!lobbyRepository.TryGetByPlayer(player, out Lobby lobby))
            {
                return HubResponse
                    .Error($"Could not find lobby that contains player: '{player.Name}'.");
            }
            if (lobby.Engine == null)
            {
                return HubResponse
                    .Error("Lobby does not have an engine.");
            }

            bool correctGuess = lobby.Engine.GuessWord(lobby.Engine.GetGamePlayer(player.ID), guess);
            if (!correctGuess)
            {
                return HubResponse<bool>.Success(false);
            }

            OnGameStateUpdated(lobby);
            return HubResponse<bool>.Success(true);
        }

        public HubResponse GetGameState()
        {
            if (!playerRepository.TryGetByConnectionId(Context.ConnectionId, out Player player))
            {
                return HubResponse
                    .Error($"Can't find player associated with connectionId: {Context.ConnectionId}");
            }
            if (!lobbyRepository.TryGetByPlayer(player, out Lobby lobby))
            {
                return HubResponse
                    .Error($"Could not find lobby that contains player: '{player.Name}'.");
            }
            if (lobby.Engine == null)
            {
                return HubResponse
                    .Error("Lobby does not have an engine.");
            }

            var gameState = lobby.Engine.GetGameStateForPlayer(lobby.Engine.GetGamePlayer(player.ID));
            return HubResponse<GameState>.Success(gameState);
        }

        private async void OnGameStateUpdated(Lobby lobby, EventArgs e = null)
        {
            if (e is GameStateUpdatedArgs gameStateArgs && gameStateArgs.GameState != null)
            {
                if (gameStateArgs.GameState.ClearCanvas)
                {
                    await Clients.SendAll("Clear", string.Empty);
                }
            }
            foreach (var player in lobby.Players)
            {
                var gameState = lobby.Engine.GetGameStateForPlayer(lobby.Engine.GetGamePlayer(player.ID));
                await Clients.SendToClient("GameStateUpdated", player.ConnectionId, gameState);
            }
        }
    }
}
