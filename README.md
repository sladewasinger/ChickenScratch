# ChickenScratch
Like pictionary or skribbl.io, but higher player limits and less ads.

## SignalR-like technology
I'm using web sockets and sort of re-creating SignalR's "hub" pattern to manage them. The true intent of this repo is to create and prototype an implementation of a decent dotnet core & JavaScript socket library. The server side is C#, and the client side is JavaScript. I've dubbed the web socket project code "HubSockets", and if all goes well I will separate the code out into its own repository.

## Shared HTML 5 Canvas
Right now you can open as many tabs as you want and connect them to the server. One person can draw in the canvas and the other people get updates after every mouse-up event from the person drawing. It's basically a real-time shared white-board, but it will turn into a game of pictionary once I am done.

# Currently in-development (top priorities):
* Switch the basic html client to an Angular client.
* Add lobbies and allow joining of lobbies via a lobby code or url.
* Add more colors/brush sizes to whiteboard.
* Change frequency of client canvas updates to be more often (not just upon artist's mouse-up event).
