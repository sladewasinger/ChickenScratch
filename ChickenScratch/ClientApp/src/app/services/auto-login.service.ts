import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, firstValueFrom } from 'rxjs';
import { CreatePlayerFormComponent } from '../components/create-player-form/create-player-form.component';
import { Player } from '../models/player';
import { LobbyStateService } from './lobby-state.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginService implements OnDestroy {
  subs: Subscription[] = [];
  myPlayer: Player | null = null;

  constructor(private lobbyStateService: LobbyStateService,
    public dialog: MatDialog) {
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

    dialogRef.afterClosed().subscribe(() => {
      console.log("closed dialog");
      this.playerCreated();
    });
  }

  playerCreated() {
    console.log(this.myPlayer);
  }

  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }
}
