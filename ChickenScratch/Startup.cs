using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ChickenScratch.Hubs;
using ChickenScratch.Repositories;
using ChickenScratch.Services;
using HubSockets;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using System.IO;
using Microsoft.Extensions.Logging;

namespace ChickenScratch
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();
            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

            services.AddSingleton<ImageRepository>();
            services.AddSingleton<LobbyRepository>();
            services.AddSingleton<PlayerRepository>();
            services.AddSingleton<ChatQueue>();
            services.AddHub<DrawHub>();
            services.AddHub<LobbyHub>();
            services.AddHub<PlayerHub>();
            services.AddHub<GameHub>();
            services.AddSingleton<LobbyStateManager>();
            services.AddTransient<GameLogicInvoker>();
            services.RegisterHubSockets();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, HubSocketAcceptor socketAcceptor, ILogger<Startup> logger)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles();
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseHubSockets(socketAcceptor, typeof(Startup).Assembly);

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    //spa.UseAngularCliServer(npmScript: "start");
                    spa.UseProxyToSpaDevelopmentServer("https://localhost:4201");
                }
            });
        }
    }
}
