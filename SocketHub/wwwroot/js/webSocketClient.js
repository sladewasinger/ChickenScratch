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

async function onMessage(e) {
    console.log("Received Message: ", e);
    
    if (!myTurn) {
        var response = await fetch("api/image/", {
            method: "GET"
        });
        var data = await response.text();
        console.log(data);

        var img = new Image();
        img.onload = () => {
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            console.log("DREW IMAGE!");
            document.body.appendChild(img);
        };
        img.src = data;
    }
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
        data: { }
    };
    write("Sending: " + JSON.stringify(hubData));
    socket.send(JSON.stringify(hubData));
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

function onInit() {
    outputDiv = document.getElementById("output");
    var canvas = document.getElementById("canvas");
    canvas.width = 600;
    canvas.height = 400;

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    canvas.addEventListener("mousedown", () => drawing = true);
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

    draw();

}

window.onload = onInit;