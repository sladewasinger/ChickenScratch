import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import { Point } from 'src/app/models/point';
import { Subscription } from 'rxjs';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';
import { GameState } from 'src/app/models/gameState';
import { Lobby } from 'src/app/models/lobby';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HubResponse } from 'src/app/models/hubResponse';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SolidBrush, BaseBrush, Eraser } from 'src/app/models/brushes/brushes';
import { HubSocketService } from 'hubsockets-client';

@Component({
  selector: 'app-lobby-game',
  templateUrl: './lobby-game.component.html',
  styleUrls: ['./lobby-game.component.scss'],
})
export class LobbyGameComponent implements OnInit {
  @ViewChild('canvas', { static: false })
  canvas: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('mouseCanvas', { static: false })
  mouseCanvas: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('chatLog', { static: false })
  chatLog: ElementRef<HTMLElement> | null = null;
  @ViewChild('imgContainer') imageContainer: ElementRef<HTMLElement> | null =
    null;
  @ViewChild('timer') timer: ElementRef<HTMLElement> | null = null;

  mousePos = new Point(0, 0);

  subs: Subscription[] = [];

  lobbyState: LobbyState | null = null;
  myPlayer: Player | null = null;
  gameState: GameState | null = null;
  guessForm: FormGroup | null = null;

  currentBrush: BaseBrush | null = null;

  secondsLeft: string = '0';

  get lobby(): Lobby | undefined {
    return this.lobbyState?.lobbies.find((l) =>
      l.players.some(
        (p) => p.connectionId == this.hubSocketService.ConnectionId
      )
    );
  }

  get players(): Player[] | undefined {
    return this.lobby?.players;
  }

  get myTurn(): boolean {
    return this.gameState?.activePlayer?.id == this.myPlayer?.id;
  }

  get myGamePlayer() {
    if (this.myPlayer?.id == null) {
      return null;
    }
    return this.gameState?.players.find((x) => x.id == this.myPlayer!.id);
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

  constructor(
    @Inject(HubSocketService) private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  async ngOnDestroy() {
    this.subs.forEach((x) => x.unsubscribe());
  }

  async ngOnInit() {
    this.subs.push(
      this.lobbyStateService.getLobbyState().subscribe((l) => {
        this.lobbyState = l;
      }),
      this.hubSocketService.listenOn<string>('Draw').subscribe((x) => {
        this.onDrawRequestReceived(x);
      }),
      this.lobbyStateService.getMyPlayer().subscribe((p) => {
        this.myPlayer = p;
      }),
      this.hubSocketService.listenOn<any>('GameStateUpdated').subscribe((x) => {
        console.log('Game State Update: ', x);
        this.gameState = x;
        if (this.gameState?.startOfNewRound === true) {
          document.body.style.backgroundColor = '#bbF';
          setTimeout(
            () => (document.body.style.backgroundColor = '#FFF'),
            1000
          );
          this.switchToBlackBrush();
          this.clearCanvas();
        }
      }),
      this.hubSocketService.listenOn<void>('Clear').subscribe((x) => {
        this.onClearRequestReceived();
      }),
      this.hubSocketService.listenOn<string>('Chat').subscribe((x) => {
        this.onChatMessagedReceived(x);
      })
    );

    try {
      var hubResponse = await this.hubSocketService.sendWithPromise<
        HubResponse<any>
      >('GetGameState', {});

      if (!hubResponse.isSuccess) {
        throw hubResponse;
      }

      this.gameState = hubResponse.data;
    } catch (error) {
      console.log('ERROR! Could not get initial game state.', error);
    }

    this.guessForm = this.formBuilder.group({
      guess: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
    });

    setInterval(this.setSecondsLeft.bind(this), 500);
  }

  setSecondsLeft() {
    if (!this.gameState || !new Date(this.gameState.timeOfRoundEnd)) {
      this.secondsLeft = 'unknown';
      return;
    }
    let seconds =
      (new Date(this.gameState.timeOfRoundEnd).getTime() -
        new Date().getTime()) /
      1000;
    seconds = seconds - 0.5;
    seconds = Math.round(seconds);
    seconds = Math.max(0, seconds);
    this.secondsLeft = seconds.toString();
  }

  ngAfterViewInit() {
    //this.canvas.nativeElement = document.getElementById("canvas") as HTMLCanvasElement;
    //this.mouseCanvas.nativeElement = document.getElementById("mouseCanvas") as HTMLCanvasElement;
    if (this.canvas == null) throw new Error('Canvas is null');

    this.canvas.nativeElement.addEventListener(
      'mousedown',
      this.onMouseDown.bind(this)
    );
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.nativeElement.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mouseout',
      this.onMouseOut.bind(this)
    );

    // Set up touch events for mobile
    this.canvas.nativeElement.addEventListener(
      'touchstart',
      (e) => {
        if (this.canvas == null) throw new Error('Canvas is null');

        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mousedown', {
          view: (e.target as any).ownerDocument.defaultView,
          bubbles: true,
          cancelable: true,
          screenX: touch.screenX, // get the touch coords
          screenY: touch.screenY, // and add them to the
          clientX: touch.clientX, // mouse event
          clientY: touch.clientY,
        });
        this.canvas.nativeElement.dispatchEvent(mouseEvent);
        e.preventDefault();
      },
      false
    );
    this.canvas.nativeElement.addEventListener(
      'touchend',
      (e) => {
        if (this.canvas == null) throw new Error('Canvas is null');

        var mouseEvent = new MouseEvent('mouseup', {});
        this.canvas.nativeElement.dispatchEvent(mouseEvent);
        window.dispatchEvent(mouseEvent);
        e.preventDefault();
      },
      false
    );
    this.canvas.nativeElement.addEventListener(
      'touchmove',
      (e) => {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mousemove', {
          view: (e.target as any).ownerDocument.defaultView,
          bubbles: true,
          cancelable: true,
          screenX: touch.screenX, // get the touch coords
          screenY: touch.screenY, // and add them to the
          clientX: touch.clientX, // mouse event
          clientY: touch.clientY,
          // 'offsetX': touch.clientX,
          // 'offsetY': touch.clientY
        });
        // send it to the same target as the touch event contact point.
        touch.target.dispatchEvent(mouseEvent);
        e.preventDefault();
      },
      false
    );

    this.canvas.nativeElement.onselectstart = () => false;

    this.switchToBlackBrush();
  }

  async onDrawRequestReceived(base64: any) {
    var data = base64 as string;

    var img = new Image();
    img.onload = () => {
      this.imageContainer?.nativeElement.appendChild(img);
      this.clearCanvas();
    };
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.pointerEvents = 'none';
    img.src = data;
  }

  private clearCanvas() {
    if (this.canvas == null) throw new Error('Canvas is null');

    var ctx = this.canvas?.nativeElement.getContext('2d');
    if (ctx == null) throw new Error('Context is null');

    ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  async onClearRequestReceived() {
    this.clearCanvas();

    const parent = this.imageContainer?.nativeElement;
    if (parent == null) {
      console.log('Parent is null');
      return;
    }
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  async onChatMessagedReceived(chatMsg: string) {
    const span = document.createElement('SPAN');
    span.innerText = chatMsg;
    span.className = 'chat-msg';
    span.style.display = 'block';
    span.style.whiteSpace = 'nowrap';
    this.chatLog?.nativeElement.prepend(span);
    // this.chatLog.nativeElement.scrollTop = this.chatLog.nativeElement.scrollHeight;
  }

  sendClear() {
    if (this.canvas == null) throw new Error('Canvas is null');

    var ctx = this.canvas.nativeElement.getContext('2d');
    ctx!.fillStyle = '#F00';
    ctx!.fillRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    ctx!.closePath();

    this.clearCanvas();

    this.hubSocketService.send('Clear', '');
  }

  setColor(color: string) {
    if (this.currentBrush == null) throw new Error('Current brush is null');

    this.switchToBlackBrush();
    this.currentBrush.setColor(color);
  }

  hashCode(str: string) {
    // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  intToRGB(i: number) {
    var c = (i & 0x00ffffff).toString(16).toUpperCase();

    return '00000'.substring(0, 6 - c.length) + c;
  }

  switchToBlackBrush() {
    this.currentBrush = new SolidBrush(
      this.canvas!.nativeElement,
      this.mouseCanvas!.nativeElement
    );
  }

  switchToEraser() {
    this.currentBrush = new Eraser(
      this.canvas!.nativeElement,
      this.mouseCanvas!.nativeElement
    );
  }

  async guessFormSubmit() {
    if (this.guess == null) throw new Error('Guess is null');

    const response = await this.hubSocketService.sendWithPromise<
      HubResponse<boolean>
    >('Guess', {
      guess: this.guess.value,
    });

    this.guess.reset();

    if (!response.isSuccess) {
      throw response;
    }
  }

  onMouseMove(e: MouseEvent) {
    if (this.currentBrush == null) throw new Error('Current brush is null');

    this.mousePos.x = e.offsetX;
    this.mousePos.y = e.offsetY;

    if (this.myTurn) {
      this.currentBrush.onMouseMove(
        new Point(this.mousePos.x, this.mousePos.y)
      );
    }
  }

  onMouseDown(e: MouseEvent) {
    if (this.currentBrush == null) throw new Error('Current brush is null');

    if (this.myTurn) {
      this.mousePos.x = e.offsetX;
      this.mousePos.y = e.offsetY;
      this.currentBrush.onMouseDown(
        new Point(this.mousePos.x, this.mousePos.y)
      );
    }
  }

  onMouseUp() {
    if (this.currentBrush == null) throw new Error('Current brush is null');

    if (this.myTurn) {
      this.currentBrush.onMouseUp();
      this.doSend();
    }
  }
  onMouseOut() {
    if (this.currentBrush == null) throw new Error('Current brush is null');

    if (this.myTurn) {
      this.currentBrush.onMouseOut();
    }
  }

  doSend() {
    if (this.canvas == null) throw new Error('Canvas is null');

    var canvasDataURL = this.canvas.nativeElement.toDataURL(); // this.canvas.toDataURL('image/jpeg', 0.6);
    let data = {
      imageBase64: canvasDataURL,
    };
    this.hubSocketService.send('draw', data);
  }
}
