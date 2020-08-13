import { Component, OnInit } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { Router } from '@angular/router';
import { LobbyCreationResponse } from 'src/app/models/lobbyCreationResponse';

@Component({
  selector: 'app-pre-lobby',
  templateUrl: './pre-lobby.component.html',
  styleUrls: ['./pre-lobby.component.scss']
})
export class PreLobbyComponent implements OnInit {

  constructor(private hubSocketService: HubSocketService,
    private router: Router) { }

  async ngOnInit() {
    //this.hubSocketService.RegisterClientMethod("LobbyCreated", this.lobbyCreated.bind(this));
    this.hubSocketService.listenOn<LobbyCreationResponse>("LobbyCreated").subscribe(x => this.lobbyCreated(x));

    await this.hubSocketService.doConnect("wss://" + window.location.hostname + ":5001/ws");
    await this.createPlayer();
  }

  lobbyCreated(data) {
    console.log("Lobby created callback! Data: ", data);
  }

  async createPlayer() {
    console.log("starting request to create PLAYER");

    try {
      var response = await this.hubSocketService.sendWithPromise("createPlayer", {
        playerName: "Player" + Math.round(1000 * Math.random())
      });

      if (!response.isSuccess) {
        throw response;
      }

      console.log("Player creation success! Response: ", response);
    }
    catch (error) {
      console.log("PLAYER creation FAILED: ", error);
    }
  }

  async createLobby() {
    console.log("starting request to create lobby");

    try {
      var response = await this.hubSocketService.sendWithPromise<LobbyCreationResponse>("createLobby", {
        lobbyName: "FirstLobby1"
      });

      if (!response.isSuccess) {
        throw response;
      }

      console.log("LOBBY CREATION RESPONSE: ", response);

      this.router.navigate(['lobby'], {
        state: {
          lobbyKey: response.lobby.key
        }
      });
    }
    catch (error) {
      console.log("lobby creation failed!");
    }
  }

  async joinLobby() {
    var lobbyKeyInput = document.getElementById("lobby-key") as HTMLInputElement;
    var lobbyKey = lobbyKeyInput.value;

    try {
      var response = await this.hubSocketService.sendWithPromise<LobbyCreationResponse>("joinLobby", {
        lobbyKey: lobbyKey
      });

      if (!response.isSuccess) {
        throw response;
      }

      console.log("Lobby joined! ", response);
      this.router.navigate(['lobby'], {
        state: {
          lobbyKey: response.lobby.key
        }
      });
    }
    catch (error) {
      console.log("join lobby failed:" + error.errorMessage);
    }
  }
}
