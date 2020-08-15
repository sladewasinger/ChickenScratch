namespace ChickenScratch.Models
{
    public class HubResponse
    {
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }

        public static HubResponse Error(string errorMsg)
        {
            return new HubResponse()
            {
                IsSuccess = false,
                ErrorMessage = errorMsg
            };
        }
    }

    public class HubResponse<T> : HubResponse
    {
        public T Data { get; set; }

        public static HubResponse<T> Success(T data)
        {
            return new HubResponse<T>()
            {
                IsSuccess = true,
                Data = data
            };
        }
    }
}
