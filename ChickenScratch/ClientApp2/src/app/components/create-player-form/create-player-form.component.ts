import { Component, OnInit } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { Router } from '@angular/router';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';
import { FormGroup, FormBuilder, NgForm, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-player-form',
  templateUrl: './create-player-form.component.html',
  styleUrls: ['./create-player-form.component.scss']
})
export class CreatePlayerFormComponent implements OnInit {
  playerForm: FormGroup;
  subs: Subscription[] = [];
  myPlayer: Player | null = null;
  totalPlayerCount: number = 0;
  loading = false;

  constructor(private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>) {
    this.playerForm = this.formBuilder.group({
      playerName: new FormControl('', [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
  }

  get playerName() {
    return this.playerForm.get('playerName');
  }

  async playerFormSubmit() {
    await this.createPlayer();
  }

  async createPlayer() {
    if (!this.playerName) {
      console.log('this.playerName is null');
      return;
    }

    try {
      this.loading = true;
      var response = await this.hubSocketService.sendWithPromise<HubResponse<Player>>("createPlayer", {
        playerName: this.playerName.value
      });

      if (!response.isSuccess) {
        throw response;
      }

      this.lobbyStateService.updateMyPlayer(response.data);
      this.dialogRef.close();
    }
    catch (error) {
      console.log("PLAYER creation FAILED: ", error);
    }
    finally {
      this.loading = false;
    }
  }
}
