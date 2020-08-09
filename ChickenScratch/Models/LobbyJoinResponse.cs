namespace ChickenScratch.Models
{
    public class LobbyJoinResponse
    {
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public Lobby Lobby { get; set; }

        public static LobbyJoinResponse Error(string errorMsg)
        {
            return new LobbyJoinResponse()
            {
                IsSuccess = false,
                ErrorMessage = errorMsg
            };
        }

        public static LobbyJoinResponse Success(Lobby lobby)
        {
            return new LobbyJoinResponse()
            {
                IsSuccess = true,
                Lobby = lobby
            };
        }
    }
}