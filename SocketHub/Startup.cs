﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WebSocketServer.Hubs;
using WebSocketServer.Repositories;

namespace WebSocketServer
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
            services.AddHub<DrawHub>();
            services.RegisterHubSockets();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, SocketHandler socketHandler)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseHubSockets(socketHandler, typeof(Startup).Assembly);

            //app.Map("/ws", a => {
            //    a.UseWebSockets();
            //    a.Use(SocketHub.SocketAcceptor);
            //});

            //SocketHub.RegisterHub<DrawHub>();
        }
    }
}
