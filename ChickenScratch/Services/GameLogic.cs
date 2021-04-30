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
using static ChickenScratch.Hubs.GameLogicInvoker;
using static ChickenScratchEngine.GameEngine;

namespace ChickenScratch.Hubs
{
    public class GameLogic
    {
        private readonly HubSocketContext Context;
        private readonly HubSocketClients Clients;
        private readonly Player player;
        private readonly Lobby lobby;

        private readonly LobbyStateManager lobbyStateManager;
        private readonly LobbyRepository lobbyRepository;
        private readonly PlayerRepository playerRepository;
        private readonly ChatQueue chatQueue;

        public GameLogic(
            HubSocketContext context,
            HubSocketClients clients,
            LobbyStateManager lobbyStateManager,
            LobbyRepository lobbyRepository,
            PlayerRepository playerRepository,
            ChatQueue chatQueue,
            Player player,
            Lobby lobby)
        {
            Context = context ?? throw new ArgumentNullException(nameof(context));
            Clients = clients ?? throw new ArgumentNullException(nameof(clients));
            this.lobbyStateManager = lobbyStateManager ?? throw new ArgumentNullException(nameof(lobbyStateManager));
            this.lobbyRepository = lobbyRepository ?? throw new ArgumentNullException(nameof(lobbyRepository));
            this.playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            this.chatQueue = chatQueue ?? throw new ArgumentNullException(nameof(chatQueue));
            this.player = player;
            this.lobby = lobby;
        }

        [NeedsPlayer, PlayerCannotBeInALobby]
        public async Task<HubResponse> JoinLobby(string lobbyKey)
        {
            if (!lobbyRepository.TryGetByLobbyKey(lobbyKey, out Lobby lobby))
            {
                return HubResponse
                    .Error($"Could not find lobby with key: '{lobbyKey}'.");
            }
            if (lobby.GameRunning)
            {
                return HubResponse
                    .Error($"Game is already running! Cannot join!");
            }

            lobby.Players.Add(player);
            lobbyRepository.AddOrUpdate(lobby.ID, lobby);

            await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());
            return HubResponse<LobbyState>.Success(lobbyStateManager.GetState());
        }

        [NeedsPlayer, PlayerCannotBeInALobby]
        public async Task<HubResponse> CreateLobby(string lobbyName)
        {
            var lobby = new Lobby()
            {
                ID = Guid.NewGuid(),
                Name = lobbyName,
                Players = new List<Player>()
                    {
                        player
                    }
            };
            lobbyRepository.AddOrUpdate(lobby.ID, lobby);

            await Clients.SendAll("LobbyStateUpdated", lobbyStateManager.GetState());
            return HubResponse<LobbyState>.Success(lobbyStateManager.GetState());
        }

        [NeedsGameInProgress]
        public HubResponse GetGameState()
        {
            var gameState = lobby.Engine.GetGameStateForPlayer(lobby.Engine.GetGamePlayer(player.ID));
            return HubResponse<GameState>.Success(gameState);
        }

        [NeedsPlayerInLobby]
        public async Task<HubResponse> StartGame()
        {
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

        [NeedsGameInProgress]
        public HubResponse Guess(string guess)
        {
            if (string.IsNullOrWhiteSpace(guess))
            {
                return HubResponse
                    .Error("Guess was empty!");
            }

            bool correctGuess = lobby.Engine.GuessWord(lobby.Engine.GetGamePlayer(player.ID), guess);
            if (!correctGuess)
            {
                string msg = $"{player.Name}: {guess}";
                chatQueue.LogChatMessage(msg);
                Clients.SendToClients("Chat", lobby.Players.Select(x => x.ConnectionId), msg);
                return HubResponse<bool>.Success(false);
            }

            string msg2 = $"Player '{player.Name}' correctly guessed the word!";
            chatQueue.LogChatMessage(msg2);
            Clients.SendToClients("Chat", lobby.Players.Select(x => x.ConnectionId), msg2);

            OnGameStateUpdated(lobby);
            return HubResponse<bool>.Success(true);
        }

        [NeedsGameInProgress]
        public async Task<HubResponse> Draw(string imageBase64)
        {
            GamePlayer gamePlayer = lobby.Engine.GetGamePlayer(player.ID);
            if (!lobby.Engine.IsPlayerTheDrawer(gamePlayer.ID))
            {
                return HubResponse.Error("Current player is not the active drawer!");
            }

            await Clients.SendToClients("Draw", lobby.Players.Select(x => x.ConnectionId), imageBase64);
            return HubResponse<bool>.Success(true);
        }

        [NeedsGameInProgress]
        public async Task<HubResponse> Clear()
        {
            GamePlayer gamePlayer = lobby.Engine.GetGamePlayer(player.ID);
            if (!lobby.Engine.IsPlayerTheDrawer(gamePlayer.ID))
            {
                return HubResponse.Error("Current player is not the active drawer!");
            }

            await Clients.SendToClients("Clear", lobby.Players.Select(x => x.ConnectionId), string.Empty);
            return HubResponse<bool>.Success(true);
        }

        private async void OnGameStateUpdated(Lobby lobby, EventArgs e = null)
        {
            if (e is GameStateUpdatedArgs gameStateArgs && gameStateArgs.GameState != null)
            {
                if (gameStateArgs.GameState.StartOfNewRound)
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
