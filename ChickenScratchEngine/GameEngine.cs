using AutoMapper;
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
            "state",
            "stomach",
            "bacteria",
            "shoulder",
            "window",
            "merry-go-round",
            "orange",
            "teacher",
            "teapot",
            "pool",
            "hair dryer",
            "lap",
            "bathtub",
            "snow",
            "battery",
            "paper clips",
            "library",
            "frying pan",
            "positive",
            "broccoli",
            "pajamas",
            "claw",
            "gum",
            "tuba",
            "music",
            "shade",
            "dinner",
            "electricity",
            "fork",
            "cocoon",
            "anvil",
            "lighthouse",
            "plant",
            "parka",
            "stick",
            "clownfish",
            "gasoline",
            "loaf",
            "pineapple",
            "sailboat",
            "newlywed",
            "carpet",
            "skate",
            "inch",
            "enter",
            "front porch",
            "ladybug",
            "canoe",
            "mattress",
            "desert",
            "monkey",
            "lemon",
            "triangle",
            "blanket",
            "rain",
            "swing",
            "cat",
            "hat",
            "lizard",
            "ladybug",
            "bear",
            "oval",
            "balloon",
            "ants",
            "bow",
            "basketball",
            "crayon",
            "stairs",
            "backpack",
            "turtle",
            "line",
            "smile",
            "cookie",
            "mitten",
            "sunglasses",
            "neck",
            "box",
            "diamond",
            "bee",
            "river",
            "Mickey Mouse",
            "socks",
            "man",
            "cherry",
            "apple",
            "zebra",
            "nose",
            "leaf",
            "snowflake",
            "bracelet",
            "football",
            "cheese",
            "jar",
            "baseball",
            "branch",
            "bone",
            "jellyfish",
            "king",
            "swimming pool"
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

            gameState.TimeOfRoundEnd = DateTime.UtcNow.Add(timerInterval);
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
            foreach (var player in gameState.Players)
            {
                player.HasGuessedCorrectly = false;
            }

            gameState.StartOfNewRound = true;
            gameState.TimeOfRoundEnd = DateTime.UtcNow.Add(timerInterval);
            OnGameStateUpdated(new GameStateUpdatedArgs() { GameState = gameState });
            gameState.StartOfNewRound = false;

            /* Start timer back up - this resets it */
            gameTimer.Start();
        }

        public bool GuessWord(GamePlayer gamePlayer, string word)
        {
            word = word.Replace(" ", string.Empty).ToLower();
            string currentWord = gameState.CurrentWord.Replace(" ", string.Empty).ToLower();
            if (word == currentWord)
            {
                if (!gamePlayer.HasGuessedCorrectly)
                {
                    gamePlayer.Score += Math.Max(10, 100 - Math.Max(0, 10 * gameState.Players.Count(x => x.HasGuessedCorrectly)));
                    gamePlayer.HasGuessedCorrectly = true;
                    gameState.ActivePlayer.Score += (int)Math.Ceiling(100.00 / (gameState.Players.Count() - 1));
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

        public bool IsPlayerTheDrawer(Guid id)
        {
            return gameState.ActivePlayer.ID == id;
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

            var config = new MapperConfiguration(cfg => {
                cfg.CreateMap<GameState, GameState>();
            });
            IMapper iMapper = config.CreateMapper();

            GameState playerGameState = iMapper.Map<GameState>(gameState);
            playerGameState.CurrentWord = "";

            return playerGameState;
        }
    }
}
