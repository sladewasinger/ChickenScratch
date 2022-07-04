# ChickenScratch

A multiplayer drawing game where one person draws and the other people guess what the drawing is! The first person to guess gets the most points.  
https://chickenscratch.azurewebsites.net/

## SignalR\*like technology

I'm using WebSockets and sort of re\*creating SignalR's "hub" pattern to manage them. The true intent of this repo is to create and prototype an implementation of a decent, free dotnet core & JavaScript WebSocket library. The server side is C#, and the client side is JavaScript. I've dubbed the web socket project code "HubSockets", and if all goes well I will separate the code out into its own repository.

## Shared HTML 5 Canvas

Right now you can open as many tabs as you want and connect them to the server. One person can draw in the canvas and the other people get updates after every mouse*up event from the person drawing. It's basically a real*time shared white\*board, but it will turn into a game of pictionary once I am done.

# Currently in\*development (top priorities):

- ~~Move HubSocket code to its own repository and make it a GitHub Package (NuGet): https://github.com/features/packages~~
- ~~Implement newly created HubSocket GitHub package via NuGet \* test everything.~~
- ~~Switch the basic html client to an Angular client.~~
- ~~Add pre\*lobby page where a player either creates a lobby or joins from a list of existing lobbies.~~
- Add lobby\*specific page where whiteboard is shown along with a list of players in the lobby.
- Add more colors/brush sizes to whiteboard.
- Change frequency of client canvas updates to be more often (not just upon artist's mouse\*up event).
- Add actual game logic \* ie player points, guessing the word, etc.
- Add levenshtein distance algorithm for determing how close a typed guess is to the word.

# How to Run:

From the commandline:

- **. . . /ChickenScratch/ChickenScratch/ClientApp/**:
  - `npm install` (first time only)
  - `npm run start*local`
- **. . . /ChickenScratch/**:
  - Just run in Visual Studio 2022 (.net 6)
  - &nbsp;&nbsp;_alternatively_:
  - `dotnet restore` (first time only)
  - `dotnet watch run **urls https://0.0.0.0 **project=ChickenScratch `
  - (The \*\*urls https://0.0.0.0 allows other devices on local network to access kestrel)
- Navigate to https://localhost:4201

# SSL Errors

If you receive an error in Chrome stating the certificate is not valid, then you need to trust the ssl.crt cert that is in the ChickenScratch\ClientApp\ssl\ folder.  
Open that folder up in file explorer, double click the servert.crt, and install/trust it.

If you're having issues, you can follow the directions listed here: https://medium.com/@rubenvermeulen/running*angular*cli*over*https*with*a*trusted*certificate*4a0d5f92747a
