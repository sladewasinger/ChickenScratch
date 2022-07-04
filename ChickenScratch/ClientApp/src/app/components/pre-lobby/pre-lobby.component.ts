import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/models/player';
import { AutoLoginService } from 'src/app/services/auto-login.service';
import { LobbyStateService } from 'src/app/services/lobby-state.service';

@Component({
  selector: 'app-pre-lobby',
  templateUrl: './pre-lobby.component.html',
  styleUrls: ['./pre-lobby.component.scss']
})
export class PreLobbyComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  myPlayer: Player | null = null;

  constructor(
    private lobbyStateService: LobbyStateService,
    private autoLogin: AutoLoginService /* This is used (needed), just not referenced */) { }

  async ngOnInit() {
    await this.setup();
  }

  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }

  async setup() {
    this.subs.push(
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      })
    );
    await this.autoLogin.setup();
  }
}
