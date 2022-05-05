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
  selector: 'app-pre-lobby',
  templateUrl: './pre-lobby.component.html',
  styleUrls: ['./pre-lobby.component.scss']
})
export class PreLobbyComponent implements OnInit {
  playerForm: FormGroup;
  joinLobbyForm: FormGroup;
  subs: Subscription[] = [];
  myPlayer: Player;
  totalPlayerCount: number;

  constructor(private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  async ngOnInit() {
    this.subs.push(
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      }),
      this.hubSocketService.onDisconnect().subscribe(x => this.onDisconnect(x))
    );

    this.playerForm = this.formBuilder.group({
      playerName: new FormControl('', [Validators.required, Validators.minLength(1)])
    });

    this.joinLobbyForm = this.formBuilder.group({
      lobbyKey: new FormControl('', [Validators.required, Validators.minLength(1)])
    });

    await this.tryConnect();
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  get playerName() {
    return this.playerForm.get('playerName');
  }

  get lobbyKey() {
    return this.joinLobbyForm.get('lobbyKey');
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

  get connected() {
    return this.hubSocketService.Connected;
  }

  async onConnected() {
    const hubResponse = await this.hubSocketService.sendWithPromise<HubResponse<number>>("GetTotalPlayerCount", {});
    const count = hubResponse.data;
    this.totalPlayerCount = count;
  }

  async onDisconnect(x) {
    console.log("ondisconnected");
    await this.tryConnect();
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

  async createLobby() {
    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("createLobby", {
        lobbyName: "FirstLobby1"
      });

      if (!response.isSuccess) {
        throw response;
      }
      let lobby = response.data.lobbies.find(l => l.players.some(p => p.id == this.myPlayer.id));
      this.router.navigate(['lobbyKey', lobby.key]);
    }
    catch (error) {
      console.log("lobby creation failed!", error);
    }
  }

  async joinLobby() {
    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("joinLobby", {
        lobbyKey: this.lobbyKey.value
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
