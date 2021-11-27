import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { LobbyStateService } from 'src/app/services/lobby-state.service';

import { Point } from 'src/app/models/point';
import { Player } from 'src/app/models/player';
import { ActivatedRoute, Router } from '@angular/router';
import { HubResponse } from 'src/app/models/hubResponse';
import { Lobby } from 'src/app/models/lobby';
import { LobbyState } from 'src/app/models/lobbyState';
import { GamePlayer, GameState } from 'src/app/models/gameState';
import { Observable, Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];

  lobbyState: LobbyState;
  myPlayer: Player;
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

  constructor(
    private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  async ngOnInit() {
    this.lobbyKey = this.route.snapshot.paramMap.get('key');
    if (!this.lobbyKey) {
      console.log("Invalid lobby key!");
      this.router.navigate(['']);
    }

    this.subs.push(
      this.lobbyStateService.getLobbyState().subscribe(l => {
        this.lobbyState = l;
      }),
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      }),
      this.hubSocketService.listenOn<any>("GameStateUpdated").subscribe(x => {
        console.log("Game State Update: ", x);
        this.gameState = x;
      })
    );

    await this.tryConnect();
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

  async onConnected() {
    if (!this.lobby) {
      console.log("Joining lobby?");
      await this.joinLobby();
    }
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
