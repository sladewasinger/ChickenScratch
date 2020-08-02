using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using WebSocketServer.Repositories;

namespace WebSocketServer
{
    public class SocketHandler
    {
        private ConcurrentBag<Type> hubTypes = new ConcurrentBag<Type>();

        private readonly JsonSerializerSettings camelCaseJsonSerializerSettings = new JsonSerializerSettings()
        {
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            },
            Formatting = Formatting.None
        };
        private readonly IServiceProvider serviceProvider;
        private readonly HubSocketRepository hubSocketRepository;

        public SocketHandler(IServiceProvider serviceProvider, HubSocketRepository hubSocketRepository)
        {
            this.serviceProvider = serviceProvider;
            this.hubSocketRepository = hubSocketRepository;
        }

        public void RegisterHubTypes(params Assembly[] assemblies)
        {
            var typesFromAssemblies = assemblies
                .SelectMany(a => a.DefinedTypes
                    .Where(x => x.AsType() != typeof(Hub))
                    .Where(x => x.GetInterfaces().Contains(typeof(IHub)))
                );
            foreach (var type in typesFromAssemblies)
            {
                hubTypes.Add(type.AsType());
            }
        }

        public async Task AddSocket(WSocket webSocket)
        {
            hubSocketRepository.AddOrUpdate(webSocket.ID.ToString(), webSocket);
            
            webSocket.DataReceived += DataReceived;

            await webSocket.ListenLoop(); // infinite loop until socket closed.

            RemoveSocket(webSocket.ID);
        }

        public async Task SocketAcceptor(HttpContext hc, Func<Task> n)
        {
            if (!hc.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var socket = await hc.WebSockets.AcceptWebSocketAsync();

            await AddSocket(new WSocket(Guid.NewGuid(), socket));
        }

        public void RemoveSocket(Guid id)
        {
            hubSocketRepository.TryRemove(id.ToString(), out WSocket removedSocket);
        }

        public async void DataReceived(object sender, EventArgs e)
        {
            if (!(e is WebSocketDataArgs webSocketEventArgs))
            {
                return;
            }

            try
            {
                foreach (var hubType in hubTypes)
                {
                    var hub = serviceProvider.GetRequiredService(hubType);

                    HubData o = JsonConvert.DeserializeObject<HubData>(webSocketEventArgs.Data);

                    string methodName = o.MethodName;
                    JObject data = o.Data as JObject;

                    var method = hub.GetType().GetMethod(methodName,
                        BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                    var methodParameters = method?.GetParameters();

                    object[] targetParams = null;
                    if (method != null && methodParameters.Any())
                    {
                        var param0 = methodParameters[0];
                        targetParams = new object[] { data.ToObject(param0.ParameterType) };
                    }
                    method.Invoke(hub, targetParams);
                }
            }
            catch(Exception ex)
            {
                //log ex here
                await SendAll(ex);
            }
        }

        public async Task SendAll<T>(T data)
        {
            await SendDataToSockets(hubSocketRepository.GetAll(), data);
        }

        public async Task SendAllExcept<T>(Guid connectionId, T data)
        {
            await SendDataToSockets(hubSocketRepository.GetAll().Where(x => x.ID != connectionId), data);
        }

        private async Task SendDataToSockets<T>(IEnumerable<WSocket> sockets, T data)
        {
            foreach(var socket in sockets)
            {
                await socket.SendData(JsonConvert.SerializeObject(data, camelCaseJsonSerializerSettings));
            }
        }
    }
}
