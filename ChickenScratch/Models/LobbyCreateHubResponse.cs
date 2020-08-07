namespace ChickenScratch.Models
{
    public class LobbyCreateHubResponse
    {
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public Lobby Lobby { get; set; }

        public static LobbyCreateHubResponse Error(string errorMsg)
        {
            return new LobbyCreateHubResponse()
            {
                IsSuccess = false,
                ErrorMessage = errorMsg
            };
        }

        public static LobbyCreateHubResponse Success(Lobby lobby)
        {
            return new LobbyCreateHubResponse()
            {
                IsSuccess = true,
                Lobby = lobby
            };
        }
    }
}