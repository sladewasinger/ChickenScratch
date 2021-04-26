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
            services.AddControllers();
            services.AddSingleton<ImageRepository>();
            services.AddSingleton<LobbyRepository>();
            services.AddSingleton<PlayerRepository>();
            services.AddHub<DrawHub>();
            services.AddHub<LobbyHub>();
            services.AddHub<PlayerHub>();
            services.AddHub<GameHub>();
            services.AddSingleton<LobbyStateManager>();
            services.RegisterHubSockets();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, HubSocketAcceptor socketAcceptor)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            app.UseRouting();

            // app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseHubSockets(socketAcceptor, typeof(Startup).Assembly);

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "chicken-scratch-app";

                if (env.IsDevelopment())
                {
                    //spa.UseAngularCliServer(npmScript: "start");
                    //spa.UseAngularCliServer(npmScript: "start");
                    spa.UseProxyToSpaDevelopmentServer("http://chickenscratch.app:4200");
                }
            });
        }
    }
}
