#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["ChickenScratch/ChickenScratch.csproj", "ChickenScratch/"]
COPY ["ChickenScratchEngine/ChickenScratchEngine.csproj", "ChickenScratchEngine/"]
RUN dotnet restore "ChickenScratch/ChickenScratch.csproj"
COPY . .
WORKDIR "/src/ChickenScratch"
RUN dotnet build "ChickenScratch.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ChickenScratch.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS https://*:5001;http://*:5000
# ENTRYPOINT ["dotnet", "ChickenScratch.dll"]
ENTRYPOINT ["dotnet", "run"]
