using ChickenScratch.Repositories;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChickenScratch.HubSockets
{
    public class HubSocketDispatcher
    {
        private readonly HubSocketRepository hubSocketRepository;
        private readonly JsonSerializerSettings camelCaseJsonSerializerSettings = new JsonSerializerSettings()
        {
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            },
            Formatting = Formatting.None
        };

        public HubSocketDispatcher(HubSocketRepository hubSocketRepository)
        {
            this.hubSocketRepository = hubSocketRepository ?? throw new ArgumentNullException(nameof(hubSocketRepository));
        }

        public async Task SendAll<T>(T data)
        {
            await SendDataToSockets(hubSocketRepository.GetAll(), data);
        }

        public async Task SendAllExcept<T>(Guid connectionId, T data)
        {
            await SendDataToSockets(hubSocketRepository.GetAll().Where(x => x.ID != connectionId), data);
        }

        private async Task SendDataToSockets<T>(IEnumerable<HubSocket> sockets, T data)
        {
            foreach (var socket in sockets)
            {
                await socket.SendData(JsonConvert.SerializeObject(data, camelCaseJsonSerializerSettings));
            }
        }
    }
}
