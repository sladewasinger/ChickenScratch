using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ChickenScratch.Repositories;

namespace ChickenScratch
{
    public class HubSocketAcceptor
    {
        private ConcurrentBag<Type> hubTypes = new ConcurrentBag<Type>();
        private readonly IServiceProvider serviceProvider;
        private readonly HubSocketRepository hubSocketRepository;

        public HubSocketAcceptor(IServiceProvider serviceProvider, HubSocketRepository hubSocketRepository)
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

        public async Task SocketAcceptor(HttpContext hc, Func<Task> n)
        {
            if (!hc.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var socket = await hc.WebSockets.AcceptWebSocketAsync();

            await AddSocket(new HubSocket(Guid.NewGuid(), socket));
        }

        public async Task AddSocket(HubSocket webSocket)
        {
            hubSocketRepository.AddOrUpdate(webSocket.ID.ToString(), webSocket);
            webSocket.DataReceived += DataReceived;

            await webSocket.ListenLoop(); // infinite loop until socket closed.

            RemoveSocket(webSocket.ID);
        }

        public void RemoveSocket(Guid id)
        {
            if (!hubSocketRepository.TryRemove(id.ToString(), out HubSocket removedSocket))
            {
                throw new Exception($"Could not remove socket with id: '{id}'");
            }
            removedSocket.Dispose();
        }

        public void DataReceived(object sender, EventArgs e)
        {
            if (!(e is HubSocketEventArgs hubSocketEventArgs))
            {
                return;
            }

            try
            {
                foreach (var hubType in hubTypes)
                {
                    var hub = serviceProvider.GetRequiredService(hubType);

                    HubData o = JsonConvert.DeserializeObject<HubData>(hubSocketEventArgs.Data);

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
            catch
            {
                //log ex here
                throw;
                //await SendAll(ex);
            }
        }
    }
}
