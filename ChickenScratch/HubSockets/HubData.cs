namespace ChickenScratch.HubSockets
{
    public class HubData
    {
        public string MethodName { get; set; }
        public object Data { get; set; }
        public int? PromiseId { get; set; }
    }
}
