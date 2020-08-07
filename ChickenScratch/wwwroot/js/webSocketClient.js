var socket;
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

function doConnect() {
    if (socket) {
        doDisconnect();
    }

    socket = new WebSocket(uri);
    socket.onopen = function (e) { write("opened " + uri); };
    socket.onclose = function (e) { write("closed"); };
    socket.onmessage = onMessage;
    socket.onerror = function (e) { write("Error: " + e.data); };
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
            hubMethod.callback(hubData.data);
            return;
        }
    }

    console.log("Received data, but nothing is listening for it!");

    //// crap code here: -- this is just me testing stuff:
    //if (false && !myTurn) {
    //    var response = await fetch("api/image/", {
    //        method: "GET"
    //    });
    //    var data = await response.text();
    //    console.log(data);

    //    var img = new Image();
    //    img.onload = () => {
    //        var canvas = document.getElementById("canvas");
    //        var ctx = canvas.getContext("2d");
    //        ctx.imageSmoothingEnabled = false;
    //        ctx.drawImage(img, 0, 0);
    //        console.log("DREW IMAGE!");
    //    };
    //    img.src = data;
    //}
}

function doDisconnect() {
    socket.close();
}

async function doSend() {
    var canvas = document.getElementById("canvas");

    var canvasDataURL = canvas.toDataURL('image/jpeg', 0.3);

    let data = { author: 'test', canvasBase64: canvasDataURL };

    var response = await fetch("api/image/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });


    console.log("Request complete!", response);

    let hubData = {
        methodName: "draw",
        data: {}
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

        console.log("LOBBY CREATION RESPONSE: ", response);
    }
    catch (error) {
        console.log("lobby creation failed!");
    }
}

async function createPlayer() {
    let hubData = {
        methodName: "createLobby",
        data: {
            lobbyName: "FirstLobby1"
        }
    };
    write("Sending: " + JSON.stringify(hubData));
    var response = await socket.send(JSON.stringify(hubData));

    console.log(response);
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

    window.requestAnimationFrame(draw);
}

function lobbyCreated(data) {
    console.log("Lobby created callback! Data: ", data);
}

function onInit() {
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
    canvas.addEventListener("mouseup", () => {
        drawing = false;
        // draw crap
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();

        if (myTurn) {
            doSend();
        }
    });
    canvas.addEventListener("mousemove", (e) => {
        oldMouseX = mouseX;
        oldMouseY = mouseY;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });


    /// TESTING:

    RegisterClientMethod("LobbyCreated", lobbyCreated);



    draw();
}

window.onload = onInit;