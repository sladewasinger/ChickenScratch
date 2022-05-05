import { Component, OnInit } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { Router } from '@angular/router';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';
import { FormGroup, FormBuilder, NgForm, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-player-form',
  templateUrl: './create-player-form.component.html',
  styleUrls: ['./create-player-form.component.scss']
})
export class CreatePlayerFormComponent implements OnInit {
  playerForm: FormGroup;
  joinLobbyForm: FormGroup;
  subs: Subscription[] = [];
  myPlayer: Player;
  totalPlayerCount: number;

  constructor(private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.playerForm = this.formBuilder.group({
      playerName: new FormControl('', [Validators.required, Validators.minLength(1)])
    });
  }

  get playerName() {
    return this.playerForm.get('playerName');
  }

  get lobbyKey() {
    return this.joinLobbyForm.get('lobbyKey');
  }

  async playerFormSubmit() {
    await this.createPlayer();
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
    }
    catch (error) {
      console.log("PLAYER creation FAILED: ", error);
    }
  }
}
