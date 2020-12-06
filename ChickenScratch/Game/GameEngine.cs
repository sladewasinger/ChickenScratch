using ChickenScratch.Extensions;
using ChickenScratch.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;

namespace ChickenScratch.Game
{
    public class GameEngine
    {
        public event EventHandler GameStateUpdated;

        private GameState gameState;
        private Timer gameTimer;
        private List<string> words = new List<string>()
        {
            "world", "pizza", "pie", "umbrella"
        };

        protected virtual void OnGameStateUpdated(EventArgs e)
        {
            GameStateUpdated?.Invoke(this, e);
        }

        public void StartGame(Lobby lobby)
        {
            gameState = new GameState()
            {
                Players = lobby.Players.Select(x => new GamePlayer()
                {
                    ConnectionId = x.ConnectionId,
                    ID = x.ID,
                    Name = x.Name,
                    Score = 0
                }).ToList(),
                CurrentWord = words[StaticRandom.Random.Next(words.Count())]
            };
            gameState.ActivePlayer = gameState.Players.First();

            gameTimer = new Timer(TimeSpan.FromSeconds(10).TotalMilliseconds);
            gameTimer.Elapsed += (s, e) => TimerExpired();
            gameTimer.AutoReset = false;
            gameTimer.Start();

            OnGameStateUpdated(EventArgs.Empty);
        }

        private void TimerExpired()
        {
            // Reset game stuff here:
            // * Change to next player
            // * Change word
            // * Reset timer

            gameTimer.Stop();

            if (!gameState.Players.Any())
            {
                return;
            }

            var index = gameState.Players.IndexOf(gameState.ActivePlayer);
            index++;
            if (index >= gameState.Players.Count())
            {
                index = 0;
            }

            gameState.ActivePlayer = gameState.Players[index];

            OnGameStateUpdated(EventArgs.Empty);

            gameTimer.Start();
        }

        public int GuessWord(GamePlayer gamePlayer, string word)
        {
            if (word.ToLower() == gameState.CurrentWord.ToLower())
            {
                gamePlayer.Score += 100;
                return 0;
            }

            return 1;
        }

        public GamePlayer GetGamePlayer(Player player)
        {
            return gameState.Players.SingleOrDefault(gp => gp.ID == player.ID);
        }

        public void PlayerLeft(GamePlayer player)
        {
            if (player == null)
                return;

            gameState.Players.Remove(player);

            if (gameState.ActivePlayer.ID == player.ID)
            {
                TimerExpired();
            }
        }

        public GameState GetGameStateForPlayer(GamePlayer gamePlayer)
        {
            if (gameState.Players.Any())
            {
                return new GameState();
            }

            if (gameState.ActivePlayer.ID == gamePlayer.ID)
            {
                return gameState;
            }

            return new GameState()
            {
                ActivePlayer = gameState.ActivePlayer,
                CurrentWord = "",
                Players = gameState.Players
            };
        }
    }
}
