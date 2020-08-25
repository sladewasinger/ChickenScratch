import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Point } from 'src/app/models/point';
import { Subscription } from 'rxjs';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';
import { GameState } from 'src/app/models/gameState';
import { Lobby } from 'src/app/models/lobby';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HubResponse } from 'src/app/models/hubResponse';

@Component({
  selector: 'app-lobby-game',
  templateUrl: './lobby-game.component.html',
  styleUrls: ['./lobby-game.component.scss']
})
export class LobbyGameComponent implements OnInit {
  drawing = false;
  canvas: HTMLCanvasElement;
  outputDiv: HTMLElement;
  mousePos = new Point(0, 0);
  oldMousePos = new Point(0, 0);

  subs: Subscription[] = [];

  lobbyState: LobbyState;
  myPlayer: Player;
  gameState: GameState;

  get lobby(): Lobby {
    return this.lobbyState?.lobbies
      .find(l => l.players.some(p => p.connectionId == this.hubSocketService.ConnectionId));
  }

  get players(): Player[] {
    return this.lobby?.players;
  }

  get myTurn(): boolean {
    return this.gameState?.activePlayer.id == this.myPlayer?.id;
  }

  constructor(private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private router: Router) {
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  async ngOnInit() {
    this.subs.push(
      this.lobbyStateService.getLobbyState().subscribe(l => {
        this.lobbyState = l;
      })
    );

    this.subs.push(
      this.hubSocketService.listenOn<string>("Draw").subscribe(x => {
        this.onDrawRequestReceived(x);
      })
    );

    this.subs.push(
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      })
    );

    this.subs.push(
      this.hubSocketService.listenOn<any>("GameStateUpdated").subscribe(x => {
        console.log("Game State Update: ", x);
        this.gameState = x;
      })
    );

    try {
      var hubResponse = await (await this.hubSocketService.sendWithPromise<HubResponse<any>>("GetGameState", {}));

      if (!hubResponse.isSuccess) {
        throw hubResponse;
      }

      this.gameState = hubResponse.data;
    }
    catch (error) {
      console.log("ERROR! Could not get initial game state.", error);
    }
  }

  ngAfterViewInit() {
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
    this.hubSocketService.send('draw', data);
  }
}
