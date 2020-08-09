﻿var socket;
var uri = "wss://" + window.location.host + "/ws";
var outputDiv;
var myTurn = false;
var drawing = false;

var mouseX = 0;
var mouseY = 0;
var oldMouseX = 0;
var oldMouseY = 0;

function write(s) {
    var p = document.createElement("p");
    p.innerHTML = s;
    outputDiv.appendChild(p);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function toggleMyTurn() {
    myTurn = !myTurn;
}

async function doConnect() {
    if (socket) {
        doDisconnect();
    }

    socket = new WebSocket(uri);
    socket.onclose = function (e) { write("closed"); };
    socket.onmessage = onMessage;

    return new Promise((resolve, reject) => {
        socket.onopen = () => {
            write("opened - " + uri);
            resolve();
        };
        socket.onerror = e => reject(e);
    });
}

var hubMethods = [];

function RegisterClientMethod(methodName, callback) {
    hubMethods.push({ methodName: methodName, callback: callback });
}

async function onMessage(e) {
    var hubData = JSON.parse(e.data);

    if (!hubData || (hubData.methodName == undefined && hubData.promiseId == undefined)) {
        console.log("Received corrupted hub data: ", e.data);
    }

    if (hubData.promiseId != undefined && hubData.promiseId != -1) {
        var promise = requestPromises.find(x => x.promiseId == hubData.promiseId);
        if (promise) {
            // console.log("Received Immediate Callback response! PromiseId: ", hubData.promiseId);
            promise.resolve(hubData.data);
            return;
        }
    } else {
        var hubMethod = hubMethods.find(x => x.methodName == hubData.methodName);
        if (hubMethod) {
            // console.log("Received message with no explicit client origin");
            await hubMethod.callback(hubData.data);
            return;
        }
    }

    console.log("Received data, but no method is registered to listen for it! MethodName: " + hubData.methodName);
}

async function onDrawRequestReceived(base64) {
    // crap code here: -- this is just me testing stuff:
    if (!myTurn) {
        //var response = await fetch("api/image/", {
        //    method: "GET"
        //});
        //var data = await response.text();
        //console.log(data);

        var data = base64;

        var img = new Image();
        img.onload = () => {
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);
        };
        img.src = data;
    }
}

function doDisconnect() {
    socket.close();
}

async function doSend() {
    var canvas = document.getElementById("canvas");
    var canvasDataURL = canvas.toDataURL('image/jpeg', 0.6);
    let hubData = {
        methodName: "draw",
        data: {
            imageBase64: canvasDataURL
        }
    };
    write("Sending: " + JSON.stringify(hubData));
    socket.send(JSON.stringify(hubData));
}

var promiseIdCounter = 0;
var requestPromises = [];
async function sendWithPromise(methodName, data) {
    let hubData = {
        methodName: methodName,
        data: data,
        promiseId: promiseIdCounter
    };

    let stringData = JSON.stringify(hubData);
    socket.send(stringData);

    var promise = new Promise((resolve, reject) => {
        requestPromises.push({ resolve: resolve, promiseId: promiseIdCounter });
        setTimeout(() => {
            reject("request timed out!")
        }, 3000);
    });

    promiseIdCounter++;
    if (promiseIdCounter >= Number.MAX_VALUE) {
        promiseIdCounter = 0;
    }

    return promise;
}

async function createLobby() {
    console.log("starting request to create lobby");

    try {
        var response = await sendWithPromise("createLobby", {
            lobbyName: "FirstLobby1"
        });

        if (!response.isSuccess) {
            throw response;
        }

        console.log("LOBBY CREATION RESPONSE: ", response);
        write("Lobby created: " + response.lobby.name);
    }
    catch (error) {
        console.log("lobby creation failed!");
        write("Lobby creation failed:" + error.errorMessage);
    }
}

async function createPlayer() {
    console.log("starting request to create PLAYER");

    try {
        var response = await sendWithPromise("createPlayer", {
            playerName: "Player" + Math.round(1000 * Math.random())
        });

        if (!response.isSuccess) {
            throw response;
        }

        console.log("Player creation success! Response: ", response);
        write("Player created: " + response.player.name);
    }
    catch (error) {
        console.log("PLAYER creation FAILED: ", error);
        write("PLAYER creation failed:" + error.errorMessage);

    }
}

async function joinLobby() {
    var lobbyKeyInput = document.getElementById("lobby-key");
    lobbyKey = lobbyKeyInput.value;

    write("Joining lobby: " + lobbyKey);
    try {
        var response = await sendWithPromise("joinLobby", {
            lobbyKey: lobbyKey
        });

        if (!response.isSuccess) {
            throw response;
        }

        write("Successfully joined lobby: " + response.lobby.name);
    }
    catch (error) {
        write("join lobby failed:" + error.errorMessage);
    }
}

function draw() {

    // draw crap
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    if (myTurn) {
        if (drawing) {
            //ctx.strokeStyle = ""
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }
    }

    // window.requestAnimationFrame(draw);
}

function lobbyCreated(data) {
    console.log("Lobby created callback! Data: ", data);
}

async function onInit() {
    outputDiv = document.getElementById("output");
    var canvas = document.getElementById("canvas");
    canvas.width = 600;
    canvas.height = 400;

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    canvas.addEventListener("mousedown", () => {
        ctx.beginPath();
        drawing = true
    });
    var stopDraw = () => {
        if (!drawing)
            return;

        drawing = false;
        // draw crap
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();

        if (myTurn) {
            doSend();
        }
    };
    window.addEventListener("mouseup", stopDraw);
    //canvas.addEventListener("mouseout", stopDraw);
    canvas.addEventListener("mousemove", (e) => {
        oldMouseX = mouseX;
        oldMouseY = mouseY;
        mouseX = e.offsetX;
        mouseY = e.offsetY;

        draw();
    });


    /// TESTING:

    RegisterClientMethod("LobbyCreated", lobbyCreated);
    RegisterClientMethod("Draw", onDrawRequestReceived);


    await doConnect();
    await createPlayer();

    //draw();
}

window.onload = onInit;