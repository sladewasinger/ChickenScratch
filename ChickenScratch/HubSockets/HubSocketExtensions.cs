using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using ChickenScratch.Repositories;

namespace ChickenScratch
{
    public static class HubSocketExtensions
    {
        public static void UseHubSockets(this IApplicationBuilder app, HubSocketAcceptor socketAcceptor, params Assembly[] assemblies)
        {
            socketAcceptor.RegisterHubTypes(assemblies);

            app.Map("/ws", a => {
                a.UseWebSockets();
                a.Use(socketAcceptor.SocketAcceptor);
            });
        }

        public static void RegisterHubSockets(this IServiceCollection services)
        {
            services.AddSingleton<HubSocketAcceptor>();
            services.AddSingleton<HubSocketRepository>();
        }

        public static void AddHub<THub>(this IServiceCollection services) where THub : Hub
        {
            services.AddTransient<THub>();
        }
    }
}
