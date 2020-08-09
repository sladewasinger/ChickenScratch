namespace ChickenScratch.Models
{
    public class RegisterPlayerResponse
    {
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public Player Player { get; set; }

        public static RegisterPlayerResponse Error(string errorMsg)
        {
            return new RegisterPlayerResponse()
            {
                IsSuccess = false,
                ErrorMessage = errorMsg
            };
        }

        public static RegisterPlayerResponse Success(Player player)
        {
            return new RegisterPlayerResponse()
            {
                IsSuccess = true,
                Player = player
            };
        }
    }
}