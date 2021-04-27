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
            services.AddHub<DrawHub>();
            services.AddHub<LobbyHub>();
            services.AddHub<PlayerHub>();
            services.AddHub<GameHub>();
            services.AddSingleton<LobbyStateManager>();
            services.RegisterHubSockets();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, HubSocketAcceptor socketAcceptor, ILogger<Startup> logger)
        {
            Log(logger);

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

            // This is handled by Azure:
            // app.UseHttpsRedirection();
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
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }

        private void Log(ILogger<Startup> logger)
        {
            // Debugging info to help with running in Docker
            string defaultCertPath = Configuration.GetSection("Kestrel:Certificates:Default:Path").Value;
            logger.LogInformation($"Kestrel Default cert path: {defaultCertPath}");
            if (!string.IsNullOrEmpty(defaultCertPath))
            {
                if (File.Exists(defaultCertPath))
                {
                    logger.LogInformation("Default Cert file exists");
                }
                else
                {
                    logger.LogInformation("Default Cert file does NOT exist!");
                }
            }
            logger.LogInformation($"Kestrel Default cert pass: {Configuration.GetSection("Kestrel:Certificates:Default:Password").Value}");

            string devCertPath = Configuration.GetSection("Kestrel:Certificates:Development:Path").Value;
            logger.LogInformation($"Kestrel Development cert path: {devCertPath}");
            if (!string.IsNullOrEmpty(devCertPath))
            {
                if (File.Exists(devCertPath))
                {
                    logger.LogInformation("Development Cert file exists");
                }
                else
                {
                    logger.LogInformation("Development Cert file does NOT exist!");
                }
            }
            logger.LogInformation($"Kestrel Development cert pass: {Configuration.GetSection("Kestrel:Certificates:Development:Password").Value}");
        }
    }
}
