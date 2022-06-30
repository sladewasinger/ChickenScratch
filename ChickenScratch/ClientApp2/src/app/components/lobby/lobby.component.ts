import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/models/player';
import { CreatePlayerFormComponent } from '../create-player-form/create-player-form.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lobby } from 'src/app/models/lobby';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  lobbyKey: string | null = null;
  subs: Subscription[] = [];
  myPlayer: Player | null = null;
  lobby: Lobby | undefined = undefined;

  constructor(private route: ActivatedRoute,
    private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    public dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    this.lobbyKey = this.route.snapshot.paramMap.get('key');

    console.log("Lobby Key: ", this.lobbyKey);

    this.subs.push(
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      }),
      this.lobbyStateService.getLobbyState().subscribe(ls => {
        this.lobby = ls?.lobbies.find(x => x.players.some(p => p.id == this.myPlayer?.id));
      })
    );

    while (!this.hubSocketService.Connected) {
      console.log("Not connected! Waiting...");
      await this.sleep(500);
    }

    this.onConnected();
  }

  onConnected() {
    console.log("YAY WE ARE CONNECT");
    const dialogRef = this.dialog.open(CreatePlayerFormComponent, {
      width: '300px',
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("closed dialog");
      this.playerNameEntered();
    });
  }

  playerNameEntered() {
    this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("createPlayer", {
      playerName: this.myPlayer?.name
    }).then(response => {
      if (!response.isSuccess) {
        throw response;
      }
      console.log("Player created:", response.data);
      this.joinLobby();
    }
    ).catch(error => {
      console.log("create player failed:", error);
    });
  }

  async sleep(sleepDurationMs: number) {
    if (sleepDurationMs < 0) throw new Error("sleepDurationMs must be positive");
    return new Promise(resolve => setTimeout(resolve, sleepDurationMs));
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  async joinLobby() {
    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("joinLobby", {
        lobbyKey: this.lobbyKey
      });

      if (!response.isSuccess) {
        console.log("Could not join lobby. Does it exist?", response);
        this.router.navigate(['/prelobby'], {
          replaceUrl: true
        });
      }
    }
    catch (error) {
      console.log("join lobby failed:", error);
    }
  }
}
