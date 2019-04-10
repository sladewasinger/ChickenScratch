var socket;
var uri = "wss://" + window.location.host + "/ws";
var outputDiv;

function write(s) {
    var p = document.createElement("p");
    p.innerHTML = s;
    outputDiv.appendChild(p);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function doConnect() {
    socket = new WebSocket(uri);
    socket.onopen = function (e) { write("opened " + uri); };
    socket.onclose = function (e) { write("closed"); };
    socket.onmessage = function (e) { write("Received: " + e.data); };
    socket.onerror = function (e) { write("Error: " + e.data); };
}

function doDisconnect() {
    socket.close();
}

function doSend() {
    let text = "[" + new Date() + "] TEST";
    write("Sending: " + text);
    socket.send(text);
}

function onInit() {
    outputDiv = document.getElementById("output");
}

window.onload = onInit;