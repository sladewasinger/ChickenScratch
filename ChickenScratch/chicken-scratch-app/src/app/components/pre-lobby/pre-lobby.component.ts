import { Component, OnInit } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { Router } from '@angular/router';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-pre-lobby',
  templateUrl: './pre-lobby.component.html',
  styleUrls: ['./pre-lobby.component.scss']
})
export class PreLobbyComponent implements OnInit {

  constructor(private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router) { }

  async ngOnInit() {
    //this.hubSocketService.RegisterClientMethod("LobbyCreated", this.lobbyCreated.bind(this));

    await this.hubSocketService.doConnect("wss://" + window.location.hostname + ":5001/ws");
    await this.createPlayer();
  }

  // lobbyCreated(data: LobbyState) {
  //   console.log("Lobby created callback! Data: ", data);
  //   this.lobbyStateService.updateLobbyState(data);
  // }

  async createPlayer() {
    console.log("starting request to create PLAYER");

    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<Player>>("createPlayer", {
        playerName: "Player" + Math.round(1000 * Math.random())
      });

      if (!response.isSuccess) {
        throw response;
      }

      this.lobbyStateService.updateMyPlayer(response.data);
      console.log("Player creation success! Response: ", response);
      //this.lobbyStateService.updateLobbyState(response.data);
    }
    catch (error) {
      console.log("PLAYER creation FAILED: ", error);
    }
  }

  async createLobby() {
    console.log("starting request to create lobby");

    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("createLobby", {
        lobbyName: "FirstLobby1"
      });

      if (!response.isSuccess) {
        throw response;
      }

      console.log("LOBBY CREATION RESPONSE: ", response);
      //this.lobbyStateService.updateLobbyState(response.data);
      this.router.navigate(['lobby']);
    }
    catch (error) {
      console.log("lobby creation failed!");
    }
  }

  async joinLobby() {
    var lobbyKeyInput = document.getElementById("lobby-key") as HTMLInputElement;
    var lobbyKey = lobbyKeyInput.value;

    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("joinLobby", {
        lobbyKey: lobbyKey
      });

      if (!response.isSuccess) {
        throw response;
      }

      console.log("Lobby joined! ", response);
      //this.lobbyStateService.updateLobbyState(response.data);
      this.router.navigate(['lobby']);
    }
    catch (error) {
      console.log("join lobby failed:" + error.errorMessage);
    }
  }
}
