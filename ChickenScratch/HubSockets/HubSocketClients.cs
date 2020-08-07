using ChickenScratch.Repositories;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChickenScratch.HubSockets
{
    public class HubSocketClients
    {
        private readonly HubSocketRepository hubSocketRepository;

        public HubSocketClients(HubSocketRepository hubSocketRepository)
        {
            this.hubSocketRepository = hubSocketRepository ?? throw new ArgumentNullException(nameof(hubSocketRepository));
        }

        public async Task SendToClient<T>(string methodName, Guid connectionId, T data)
        {
            if (hubSocketRepository.TryGet(connectionId, out HubSocket hubSocket))
            {
                await SendDataToSocket(methodName, hubSocket, data);
            }
        }

        public async Task SendToClients<T>(string methodName, IEnumerable<Guid> connectionIds, T data)
        {
            var hubSockets = hubSocketRepository.GetAll().Where(x => connectionIds.Contains(x.ID));
            await SendDataToSockets(methodName, hubSockets, data);
        }

        public async Task SendAll<T>(string methodName, T data)
        {
            await SendDataToSockets(methodName, hubSocketRepository.GetAll(), data);
        }

        public async Task SendAllExcept<T>(string methodName, Guid connectionId, T data)
        {
            await SendDataToSockets(methodName, hubSocketRepository.GetAll().Where(x => x.ID != connectionId), data);
        }

        private async Task SendDataToSockets<T>(string methodName, IEnumerable<HubSocket> sockets, T data)
        {
            foreach (var socket in sockets)
            {
                await SendDataToSocket(methodName, socket, data);
            }
        }

        private async Task SendDataToSocket<T>(string methodName, HubSocket socket, T data)
        {
            var hubData = new HubData()
            {
                Data = data,
                MethodName = methodName,
                PromiseId = -1
            };
            await socket.SendData(hubData);
        }
    }
}
