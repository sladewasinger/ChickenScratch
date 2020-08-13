import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { Point } from 'src/app/models/point';
import { Player } from 'src/app/models/player';
import { ActivatedRoute } from '@angular/router';
import { HubResponse } from 'src/app/models/hubResponse';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  drawing = false;
  canvas: HTMLCanvasElement;
  outputDiv: HTMLElement;
  myTurn = false;
  mousePos = new Point(0, 0);
  oldMousePos = new Point(0, 0);
  uri = "wss://" + window.location.hostname + ":5001/ws";
  lobbyKey: string;

  players: Player[] = [{ name: 'test', connectionId: '', id: '1' }];
  text: string = 't';

  constructor(private hubSocketService: HubSocketService,
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef) {
  }

  async ngOnInit() {
    console.log("STATE: ", window.history.state);
    this.lobbyKey = window.history.state.lobbyKey;

    this.outputDiv = document.getElementById("output");
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.canvas.width = 500;
    this.canvas.height = 400;

    var ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;

    this.canvas.addEventListener("mousedown", this.startDraw.bind(this));
    window.addEventListener("mouseup", this.stopDraw.bind(this));
    //canvas.addEventListener("mouseout", stopDraw);
    this.canvas.addEventListener("mousemove", this.captureMousePos.bind(this));

    // Set up touch events for mobile, etc
    this.canvas.addEventListener("touchstart", (e) => {
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
      e.preventDefault();
    }, false);
    this.canvas.addEventListener("touchend", (e) => {
      var mouseEvent = new MouseEvent("mouseup", {});
      this.canvas.dispatchEvent(mouseEvent);
      window.dispatchEvent(mouseEvent);
      e.preventDefault();
    }, false);
    this.canvas.addEventListener("touchmove", (e) => {
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent( // create event
        'mousemove',   // type of event
        {
          'view': (event.target as any).ownerDocument.defaultView,
          'bubbles': true,
          'cancelable': true,
          'screenX': touch.screenX,  // get the touch coords 
          'screenY': touch.screenY,  // and add them to the 
          'clientX': touch.clientX,  // mouse event
          'clientY': touch.clientY
          // 'offsetX': touch.clientX,
          // 'offsetY': touch.clientY
        });
      // send it to the same target as the touch event contact point.
      touch.target.dispatchEvent(mouseEvent);
      e.preventDefault();
    }, false);


    // page tweaks:
    this.canvas.onselectstart = () => false;

    /// TESTING:
    //this.hubSocketService.RegisterClientMethod("Draw", (e) => this.onDrawRequestReceived(e));
    //this.hubSocketService.RegisterClientMethod("PlayerJoinedLobby", (e) => this.playerJoined(e));

    this.hubSocketService.listenOn<Player>("PlayerJoinedLobby").subscribe(x => {
      console.log("PLAYER JOINED");
      this.playerJoined(x);
    });
  }

  public playerJoined(e) {
    console.log("player joined", e);
    this.text = e.name;
    this.players.push(e);
    this.changeDetector.detectChanges();
  }

  trackPlayer(index, player: Player) {
    return player ? player.id : undefined;
  }

  public toggleMyTurn() {
    this.myTurn = !this.myTurn;
  }

  async onDrawRequestReceived(base64) {
    if (!this.myTurn) {
      var data = base64;

      var img = new Image();
      img.onload = () => {
        var ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
      };
      img.src = data;
    }
  }

  getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  }

  draw() {
    var ctx = this.canvas.getContext("2d");

    if (this.myTurn) {
      if (this.drawing) {
        ctx.lineTo(this.mousePos.x, this.mousePos.y);
        ctx.stroke();
      }
    }
  }

  captureMousePos(e: MouseEvent) {
    this.oldMousePos.x = this.mousePos.x;
    this.oldMousePos.y = this.mousePos.y;
    this.mousePos.x = e.offsetX;
    this.mousePos.y = e.offsetY;

    this.draw();
  }

  startDraw() {
    var ctx = this.canvas.getContext("2d");
    ctx.beginPath();
    this.drawing = true
  }

  stopDraw() {
    if (!this.drawing)
      return;

    this.drawing = false;
    var ctx = this.canvas.getContext("2d");
    ctx.beginPath();

    if (this.myTurn) {
      this.doSend();
    }
  }

  doSend() {
    var canvas = document.getElementById("canvas");
    var canvasDataURL = this.canvas.toDataURL('image/jpeg', 0.6);
    let data = {
      imageBase64: canvasDataURL
    };
    this.write("sending drawing");
    this.hubSocketService.send('draw', data);
  }

  write(s) {
    var p = document.createElement("p");
    p.innerHTML = s;
    this.outputDiv.appendChild(p);
    this.outputDiv.scrollTop = this.outputDiv.scrollHeight;
  }
}
