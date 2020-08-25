import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { LobbyStateService } from 'src/app/services/lobby-state.service';

import { Point } from 'src/app/models/point';
import { Player } from 'src/app/models/player';
import { ActivatedRoute, Router } from '@angular/router';
import { HubResponse } from 'src/app/models/hubResponse';
import { Lobby } from 'src/app/models/lobby';
import { LobbyState } from 'src/app/models/lobbyState';
import { GameState } from 'src/app/models/gameState';
import { Observable, Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {
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
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      })
    );
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
}
