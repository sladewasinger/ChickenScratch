FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001

ENV ASPNETCORE_URLS=https://+:5001;http://+:5000

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["ChickenScratch/ChickenScratch.csproj", "ChickenScratch/"]
COPY ["ChickenScratchEngine/ChickenScratchEngine.csproj", "ChickenScratchEngine/"]
RUN dotnet restore "ChickenScratch/ChickenScratch.csproj"
COPY . .
WORKDIR "/src/ChickenScratch"
RUN dotnet build "ChickenScratch.csproj" -c Release -o /app/build
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get install -y gnupg2 && \
    wget -qO- https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y build-essential nodejs

FROM build AS publish
RUN dotnet publish "ChickenScratch.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ChickenScratch.dll"]
