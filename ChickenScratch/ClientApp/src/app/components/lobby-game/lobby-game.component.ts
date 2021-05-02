import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SolidBrush, BaseBrush, Eraser } from 'src/app/models/brushes/brushes';

@Component({
  selector: 'app-lobby-game',
  templateUrl: './lobby-game.component.html',
  styleUrls: ['./lobby-game.component.scss']
})
export class LobbyGameComponent implements OnInit {
  @ViewChild("canvas", { static: false }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild("mouseCanvas", { static: false }) mouseCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild("chatLog", { static: false }) chatLog: ElementRef<HTMLElement>;
  @ViewChild("imgContainer") imageContainer;

  mousePos = new Point(0, 0);

  subs: Subscription[] = [];

  lobbyState: LobbyState;
  myPlayer: Player;
  gameState: GameState;
  guessForm: FormGroup;

  currentBrush: BaseBrush;

  get lobby(): Lobby {
    return this.lobbyState?.lobbies
      .find(l => l.players.some(p => p.connectionId == this.hubSocketService.ConnectionId));
  }

  get players(): Player[] {
    return this.lobby?.players;
  }

  get myTurn(): boolean {
    return this.gameState?.activePlayer?.id == this.myPlayer?.id;
  }

  get myGamePlayer() {
    return this.gameState?.players.find(x => x.id == this.myPlayer.id);
  }

  get guess() {
    return this.guessForm?.get('guess');
  }

  get activePlayer() {
    return this.gameState?.activePlayer;
  }

  get gamePlayers() {
    return this.gameState?.players;
  }

  constructor(private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private formBuilder: FormBuilder) {
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  async ngOnInit() {
    this.subs.push(
      this.lobbyStateService.getLobbyState().subscribe(l => {
        this.lobbyState = l;
      }),
      this.hubSocketService.listenOn<string>("Draw").subscribe(x => {
        this.onDrawRequestReceived(x);
      }),
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      }),
      this.hubSocketService.listenOn<any>("GameStateUpdated").subscribe(x => {
        console.log("Game State Update: ", x);
        this.gameState = x;
        if (this.gameState.startOfNewRound) {
          document.body.style.backgroundColor = "#bbF";
          setTimeout(() => document.body.style.backgroundColor = "#FFF", 1000);
          this.switchToBlackBrush();
          this.clearCanvas();
        }
      }),
      this.hubSocketService.listenOn<void>("Clear").subscribe(x => {
        this.onClearRequestReceived();
      }),
      this.hubSocketService.listenOn<string>("Chat").subscribe(x => {
        this.onChatMessagedReceived(x);
      })
    );

    try {
      var hubResponse = await this.hubSocketService.sendWithPromise<HubResponse<any>>("GetGameState", {});

      if (!hubResponse.isSuccess) {
        throw hubResponse;
      }

      this.gameState = hubResponse.data;
    }
    catch (error) {
      console.log("ERROR! Could not get initial game state.", error);
    }

    this.guessForm = this.formBuilder.group({
      guess: new FormControl('', [Validators.required, Validators.minLength(1)])
    });
  }

  ngAfterViewInit() {
    //this.canvas.nativeElement = document.getElementById("canvas") as HTMLCanvasElement;
    //this.mouseCanvas.nativeElement = document.getElementById("mouseCanvas") as HTMLCanvasElement;

    this.canvas.nativeElement.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.nativeElement.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.nativeElement.addEventListener("mouseout", this.onMouseOut.bind(this));

    // Set up touch events for mobile
    this.canvas.nativeElement.addEventListener("touchstart", (e) => {
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.nativeElement.dispatchEvent(mouseEvent);
      e.preventDefault();
    }, false);
    this.canvas.nativeElement.addEventListener("touchend", (e) => {
      var mouseEvent = new MouseEvent("mouseup", {});
      this.canvas.nativeElement.dispatchEvent(mouseEvent);
      window.dispatchEvent(mouseEvent);
      e.preventDefault();
    }, false);
    this.canvas.nativeElement.addEventListener("touchmove", (e) => {
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent(
        'mousemove',
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
    this.canvas.nativeElement.onselectstart = () => false;

    this.switchToBlackBrush();
  }

  async onDrawRequestReceived(base64) {
    var data = base64 as string;

    var img = new Image();
    img.onload = () => {
      this.imageContainer.nativeElement.appendChild(img);
      this.clearCanvas();
    };
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.pointerEvents = 'none';
    img.src = data;
  }

  private clearCanvas() {
    var ctx = this.canvas.nativeElement.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  async onClearRequestReceived() {
    this.clearCanvas();

    const parent = this.imageContainer.nativeElement;

    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  async onChatMessagedReceived(chatMsg: string) {
    const span = document.createElement("SPAN");
    span.innerText = chatMsg;
    span.className = "chat-msg";
    span.style.display = "block";
    span.style.whiteSpace = "nowrap";
    this.chatLog.nativeElement.appendChild(span);
    this.chatLog.nativeElement.scrollTop = this.chatLog.nativeElement.scrollHeight;
  }

  sendClear() {
    var ctx = this.canvas.nativeElement.getContext("2d");
    ctx.fillStyle = "#F00";
    ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    ctx.closePath();

    this.clearCanvas();

    this.hubSocketService.send("Clear", "");
  }

  setColor(color) {
    if (this.currentBrush.setColor) {
      this.currentBrush.setColor(color);
    }
  }

  hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  intToRGB(i) {
    var c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
  }

  switchToBlackBrush() {
    this.currentBrush = new SolidBrush(this.canvas.nativeElement, this.mouseCanvas.nativeElement);
  }

  switchToEraser() {
    this.currentBrush = new Eraser(this.canvas.nativeElement, this.mouseCanvas.nativeElement);
  }

  async guessFormSubmit() {
    const response = await this.hubSocketService.sendWithPromise<HubResponse<boolean>>("Guess", {
      guess: this.guess.value
    });

    this.guess.reset();

    if (!response.isSuccess) {
      throw response;
    }
  }

  onMouseMove(e: MouseEvent) {
    this.mousePos.x = e.offsetX;
    this.mousePos.y = e.offsetY;

    if (this.myTurn) {
      this.currentBrush.onMouseMove(this.mousePos);
    }
  }

  onMouseDown() {
    if (this.myTurn) {
      this.currentBrush.onMouseDown();
    }
  }

  onMouseUp() {
    if (this.myTurn) {
      this.currentBrush.onMouseUp();
      this.doSend();
    }
  }
  onMouseOut() {
    if (this.myTurn) {
      this.currentBrush.onMouseOut();
    }
  }

  doSend() {
    var canvasDataURL = this.canvas.nativeElement.toDataURL(); // this.canvas.toDataURL('image/jpeg', 0.6);
    let data = {
      imageBase64: canvasDataURL
    };
    this.hubSocketService.send('draw', data);
  }
}
