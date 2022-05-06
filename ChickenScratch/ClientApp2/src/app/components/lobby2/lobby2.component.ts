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

@Component({
  selector: 'app-lobby2',
  templateUrl: './lobby2.component.html',
  styleUrls: ['./lobby2.component.scss']
})
export class Lobby2Component implements OnInit {
  lobbyKey: string | null = null;
  subs: Subscription[] = [];
  myPlayer: Player | null = null;

  constructor(private route: ActivatedRoute,
    private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.lobbyKey = this.route.snapshot.paramMap.get('key');
    console.log("Lobby Key: ", this.lobbyKey);

    this.subs.push(
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      })
    );

    const dialogRef = this.dialog.open(CreatePlayerFormComponent, {
      width: '300px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("closed dialog");
    });
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
        throw response;
      }

      this.router.navigate(['lobby']);
    }
    catch (error) {
      console.log("join lobby failed:", error);
    }
  }
}
