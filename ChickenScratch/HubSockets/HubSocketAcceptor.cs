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
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using System.Collections.Generic;

namespace ChickenScratch.HubSockets
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

        public async Task AddSocket(HubSocket hubSocket)
        {
            hubSocketRepository.AddOrUpdate(hubSocket.ID, hubSocket);
            hubSocket.DataReceived += DataReceived;

            await hubSocket.ListenLoop(); // infinite loop until socket closed.

            RemoveSocket(hubSocket.ID);
        }

        public void RemoveSocket(Guid id)
        {
            if (!hubSocketRepository.TryRemove(id, out HubSocket removedSocket))
            {
                throw new Exception($"Could not remove socket with id: '{id}'");
            }
            removedSocket.Dispose();
        }

        public async void DataReceived(object sender, EventArgs e)
        {
            if (!(e is HubSocketEventArgs hubSocketEventArgs))
            {
                return;
            }

            try
            {
                foreach (var hubType in hubTypes)
                {
                    Hub hub = serviceProvider.GetRequiredService(hubType) as Hub;
                    hub.Clients = serviceProvider.GetRequiredService<HubSocketClients>();
                    hub.Context = new HubSocketContext(hubSocketEventArgs.HubSocket);

                    HubData requestHubData = JsonConvert.DeserializeObject<HubData>(hubSocketEventArgs.Data);

                    string methodName = requestHubData.MethodName;
                    JObject data = requestHubData.Data as JObject;

                    var method = hub.GetType().GetMethod(methodName,
                        BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

                    if (method != null)
                    {
                        var methodParameters = method.GetParameters();
                        List<object> targetParams = null;

                        if (methodParameters.Any())
                        {
                            targetParams = new List<object>();
                            var jProperties = data.Properties();

                            foreach (var param in methodParameters)
                            {
                                var jProp = jProperties.Single(x => x.Name == param.Name);
                                targetParams.Add(jProp.ToObject(param.ParameterType));
                            }
                            //var param0 = methodParameters[0];
                            //targetParams = new object[] { data.ToObject(param0.ParameterType) };
                        }

                        try
                        {
                            var task = (Task)method.Invoke(hub, targetParams?.ToArray());

                            await task.ConfigureAwait(false);

                            var resultProperty = task.GetType().GetProperty("Result");
                            var response = resultProperty.GetValue(task);

                            if (response != null)
                            {
                                HubData immediateResponse = new HubData()
                                {
                                    Data = response,
                                    MethodName = null,
                                    PromiseId = requestHubData.PromiseId
                                };
                                
                                await hubSocketEventArgs.HubSocket.SendData(immediateResponse);
                            }
                        }
                        catch (Exception ex)
                        {
                            await hub.Clients.SendToClient("Error", hub.Context.ConnectionId, ex);
                        }
                    }

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
