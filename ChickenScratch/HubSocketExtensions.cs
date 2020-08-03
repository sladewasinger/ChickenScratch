using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using ChickenScratch.Repositories;

namespace ChickenScratch
{
    public static class HubSocketExtensions
    {
        public static void UseHubSockets(this IApplicationBuilder app, SocketHandler socketHandler, params Assembly[] assemblies)
        {
            socketHandler.RegisterHubTypes(assemblies);

            app.Map("/ws", a => {
                a.UseWebSockets();
                a.Use(socketHandler.SocketAcceptor);
            });
        }

        public static void RegisterHubSockets(this IServiceCollection services)
        {
            services.AddSingleton<SocketHandler>();
            services.AddSingleton<HubSocketRepository>();
        }

        public static void AddHub<THub>(this IServiceCollection services) where THub : class
        {
            services.AddTransient<THub>();
        }
    }
}
