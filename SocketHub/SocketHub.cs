using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using static WebSocketServer.WSocket;

namespace WebSocketServer
{
    public static class SocketHub
    {
        static ConcurrentDictionary<Guid, WSocket> webSockets = new ConcurrentDictionary<Guid, WSocket>();
        static ConcurrentBag<Type> hubs = new ConcurrentBag<Type>();

        public static void RegisterHub<T>() where T : Hub
        {
            hubs.Add(typeof(T));
        }

        public static async Task AddSocket(WSocket webSocket)
        {
            webSockets.TryAdd(webSocket.ID, webSocket);
            webSocket.DataReceived += DataReceived;

            await webSocket.ListenLoop();
        }

        public static async Task SocketAcceptor(HttpContext hc, Func<Task> n)
        {
            if (!hc.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var socket = await hc.WebSockets.AcceptWebSocketAsync();

            await AddSocket(new WSocket(Guid.NewGuid(), socket));
        }

        public static void RemoveSocket(Guid id)
        {
            webSockets.TryRemove(id, out WSocket removedSocket);
        }

        public static async void DataReceived(object sender, EventArgs e)
        {
            if (!(e is WebSocketDataArgs dataArgs))
            {
                return;
            }

            try
            {
                foreach (var hubType in hubs)
                {
                    var hub = hubType.GetConstructor(new Type[] { }).Invoke(new object[] { });

                    HubData o = JsonConvert.DeserializeObject<HubData>(dataArgs.Data);

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

        public static async Task Echo<T>(WSocket wSocket, T data)
        {
            await SendAll($"[ID: {wSocket.ID}]: {data}");
        }

        public static async Task SendAll<T>(T data)
        {
            DefaultContractResolver contractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            };

            JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings()
            {
                ContractResolver = contractResolver,
                Formatting = Formatting.None
            };

            foreach (var socket in webSockets.Values)
            {
                await socket.SendData(JsonConvert.SerializeObject(data, jsonSerializerSettings));
            }
        }
    }
}
