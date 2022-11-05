import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HubSocketService } from 'hubsockets-client';
import { HubResponse } from 'src/app/models/hubResponse';
import { Lobby } from 'src/app/models/lobby';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.scss'],
})
export class CreateLobbyComponent implements OnInit {
  form!: FormGroup;
  lobby: Lobby | undefined = undefined;
  @Input() myPlayer: Player | null = null;

  constructor(
    private router: Router,
    @Inject(HubSocketService) private hubSocketService: HubSocketService
  ) {}

  async ngOnInit(): Promise<void> {
    this.form = new FormGroup({
      lobbyName: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  get isLobbyNameControlInvalid(): boolean {
    return (
      this.lobbyNameControl?.invalid &&
      (this.lobbyNameControl?.touched || this.lobbyNameControl?.dirty)
    );
  }

  get lobbyNameControl(): FormControl {
    return this.form.get('lobbyName') as FormControl;
  }

  onSubmit(): void {
    this.form.disable(); /* Prevent double submission */

    this.hubSocketService
      .sendWithPromise<HubResponse<LobbyState>>('createLobby', {
        lobbyName: this.lobbyNameControl.value,
      })
      .then((response) => {
        if (!response.isSuccess) {
          throw response;
        }
        const myLobby = response.data.lobbies.find((l) =>
          l.players.find((p) => p.id == this.myPlayer!.id)
        );
        console.log('Lobby created:', response.data);
        this.router.navigate(['/lobby', myLobby?.key]);
      })
      .catch((error) => {
        console.log('create lobby failed:', error);
      });
  }
}
