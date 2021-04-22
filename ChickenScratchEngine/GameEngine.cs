using ChickenScratchEngine.Extensions;
using ChickenScratchEngine.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;

namespace ChickenScratchEngine
{
    public class GameEngine
    {
        public event EventHandler GameStateUpdated;

        public class GameStateUpdatedArgs : EventArgs
        {
            public GameState GameState { get; set; }
        }

        private GameState gameState;
        private Timer gameTimer;
        private TimeSpan timerInterval = TimeSpan.FromSeconds(60);

        private static IReadOnlyList<string> readonlyWords = new List<string>()
        {
            "world", "pizza", "pie", "umbrella", "elbow", "smile", "chapstick", "headphones", "keyboard"
        };
        private List<string> words = new List<string>(readonlyWords);

        protected virtual void OnGameStateUpdated(EventArgs e)
        {
            GameStateUpdated?.Invoke(this, e);
        }

        public GamePlayer CreateGamePlayer(string name, Guid id)
        {
            return new GamePlayer()
            {
                Name = name,
                ID = id,
                Score = 0
            };
        }

        public void StartGame(List<GamePlayer> players)
        {
            gameState = new GameState()
            {
                Players = players
            };
            PickRandomWord(gameState);
            gameState.ActivePlayer = gameState.Players.First();

            gameTimer = new Timer();
            gameTimer.Interval = timerInterval.TotalMilliseconds;
            gameTimer.Elapsed += (s, e) => TimerExpired();
            gameTimer.AutoReset = false;
            gameTimer.Start();

            OnGameStateUpdated(EventArgs.Empty);
        }

        private void PickRandomWord(GameState gs)
        {
            if (words.Count() == 0)
            {
                words = new List<string>(readonlyWords);
            }
            var i = StaticRandom.Random.Next(words.Count());
            var word = words[i];
            words.RemoveAt(i);
            gs.CurrentWord = word;
        }

        private void TimerExpired()
        {
            // Reset game stuff here:
            // * Change to next player
            // * Change word
            // * Reset timer

            gameTimer.Stop();
            gameTimer.Interval = timerInterval.TotalMilliseconds;

            if (!gameState.Players.Any())
            {
                return;
            }

            /* Change to next player */
            var index = gameState.Players.IndexOf(gameState.ActivePlayer);
            index++;
            if (index >= gameState.Players.Count())
            {
                index = 0;
            }
            gameState.ActivePlayer = gameState.Players[index];

            /* Change word */
            PickRandomWord(gameState);


            /* Reset game state to fresh round state */
            foreach(var player in gameState.Players)
            {
                player.HasGuessedCorrectly = false;
            }

            gameState.ClearCanvas = true;
            OnGameStateUpdated(new GameStateUpdatedArgs() { GameState = gameState });
            gameState.ClearCanvas = false;

            /* Start timer back up - this resets it */
            gameTimer.Start();
        }

        public bool GuessWord(GamePlayer gamePlayer, string word)
        {
            if (word.ToLower() == gameState.CurrentWord.ToLower())
            {
                if (!gamePlayer.HasGuessedCorrectly)
                {
                    gamePlayer.HasGuessedCorrectly = true;
                    gamePlayer.Score += 100;
                }

                if (gameState.Players
                    .Where(x => x.ID != gameState.ActivePlayer.ID)
                    .All(x => x.HasGuessedCorrectly))
                {
                    SetTimerToOneSecond();
                }

                return true;
            }

            return false;
        }

        private void SetTimerToOneSecond()
        {
            gameTimer.Stop();
            gameTimer.Interval = TimeSpan.FromSeconds(1).TotalMilliseconds;
            gameTimer.Start();
        }

        public GamePlayer GetGamePlayer(Guid id)
        {
            return gameState.Players.SingleOrDefault(p => p.ID == id);
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
            if (!gameState.Players.Any())
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
