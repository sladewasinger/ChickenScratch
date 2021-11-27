import { Component, OnInit } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';
import { FormGroup, FormBuilder, NgForm, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GamePlayer, GameState } from 'src/app/models/gameState';
import { Lobby } from 'src/app/models/lobby';

@Component({
  selector: 'app-pre-lobby',
  templateUrl: './pre-lobby.component.html',
  styleUrls: ['./pre-lobby.component.scss']
})
export class PreLobbyComponent implements OnInit {
  playerForm: FormGroup;
  joinLobbyForm: FormGroup;
  subs: Subscription[] = [];
  myPlayer: Player;
  totalPlayerCount: number;

  lobbyState: LobbyState;
  gameState: GameState;
  lobbyKey: string;

  get lobby(): Lobby {
    return this.lobbyState?.lobbies.find(l => l.key == this.lobbyKey);
  }

  get players(): Player[] {
    return this.lobby?.players;
  }

  get gamePlayers(): GamePlayer[] {
    return this.gameState?.players;
  }

  get myTurn(): boolean {
    return this.gameState?.activePlayer.id == this.myPlayer?.id;
  }

  constructor(private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) { }

  async ngOnInit() {
    this.lobbyKey = this.route.snapshot.paramMap.get('key');
    if (!this.lobbyKey) {
      console.log("Invalid lobby key!");
      this.router.navigate(['']);
    }

    this.subs.push(
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      }),
      this.lobbyStateService.getLobbyState().subscribe(l => {
        this.lobbyState = l;
      }),
      this.hubSocketService.listenOn<any>("GameStateUpdated").subscribe(x => {
        console.log("Game State Update: ", x);
        this.gameState = x;
      }),
      this.hubSocketService.onDisconnect().subscribe(x => this.onDisconnect(x))
    );

    this.playerForm = this.formBuilder.group({
      playerName: new FormControl('', [Validators.required, Validators.minLength(1)])
    });

    this.joinLobbyForm = this.formBuilder.group({
      lobbyKeyInput: new FormControl('', [Validators.required, Validators.minLength(1)])
    });

    await this.tryConnect();
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  get playerName() {
    return this.playerForm.get('playerName');
  }

  get lobbyKeyInput() {
    return this.joinLobbyForm.get('lobbyKeyInput');
  }

  async tryConnect() {
    console.log("attempting connect");
    try {
      await this.hubSocketService.doConnect("wss://" + window.location.hostname + ":443/ws");
      await this.onConnected();
    } catch (error) {
      console.log("ERROR connecting to hub socket service: ", error);
    }
  }

  get connected() {
    return this.hubSocketService.Connected;
  }

  async onConnected() {
    const hubResponse = await this.hubSocketService.sendWithPromise<HubResponse<number>>("GetTotalPlayerCount", {});
    const count = hubResponse.data;
    this.totalPlayerCount = count;
  }

  async onDisconnect(x) {
    console.log("ondisconnected");
    await this.tryConnect();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async playerFormSubmit() {
    await this.createPlayer();
  }

  async startGame() {
    try {
      var result = await this.hubSocketService.sendWithPromise<any>("StartGame", {});
      this.gameState = result;
      ///this.router.navigate(['lobby-game']);
    }
    catch (error) {
      console.log("ERROR starting game!", error);
    }
  }

  async createPlayer() {
    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<Player>>("createPlayer", {
        playerName: this.playerName.value
      });

      if (!response.isSuccess) {
        throw response;
      }

      this.lobbyStateService.updateMyPlayer(response.data);
      if (this.lobbyKey) {
        this.joinLobby();
      }
    }
    catch (error) {
      console.log("PLAYER creation FAILED: ", error);
    }
  }

  async createLobby() {
    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("createLobby", {
        lobbyName: "FirstLobby1"
      });

      if (!response.isSuccess) {
        throw response;
      }
      var lobby = response.data.lobbies.find(l => l.players.some(p => p.id == this.myPlayer.id));
      this.lobbyKey = lobby.key;
      this.router.navigate(['lobby', this.lobbyKey]);
      console.log(this.lobby);
    }
    catch (error) {
      console.log("lobby creation failed!", error);
    }
  }

  async joinLobby() {
    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("joinLobby", {
        lobbyKey: this.lobbyKey
      });

      if (!response.isSuccess) {
        throw response;
      }

      this.router.navigate(['lobby', this.lobbyKey]);
    }
    catch (error) {
      console.log("join lobby failed:", error);
    }
  }
}
