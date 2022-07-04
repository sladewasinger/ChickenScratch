import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { CreatePlayerFormComponent } from '../create-player-form/create-player-form.component';

@Component({
  selector: 'app-pre-lobby',
  templateUrl: './pre-lobby.component.html',
  styleUrls: ['./pre-lobby.component.scss']
})
export class PreLobbyComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  myPlayer: Player | null = null;

  constructor(private route: ActivatedRoute,
    private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    public dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
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

    try {
      this.myPlayer = await firstValueFrom(this.lobbyStateService.getMyPlayer());
    }
    catch (error) {
      console.log('Error getting myPlayer!', error);
    }

    if (!this.myPlayer) {
      console.log("NO PLAYER?!");
      this.openPlayerDialog();
    } else {
      console.log("My player: ", this.myPlayer);
    }
  }

  openPlayerDialog(): void {
    const dialogRef = this.dialog.open(CreatePlayerFormComponent, {
      width: '300px',
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("closed dialog");
      this.playerCreated();
    });
  }

  playerCreated() {
    console.log(this.myPlayer);
  }
}
