import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Point } from 'src/app/models/point';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { Router } from '@angular/router';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { Player } from 'src/app/models/player';
import { FormGroup, FormBuilder, NgForm, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
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

  ngAfterViewInit() {
    var siteWidth = 600; // in index.html
    var scale = screen.width / siteWidth;

    document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=' + siteWidth + ', initial-scale=' + scale + '');
    console.log("changing scale to : " + scale);
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
      console.log("Connected!");
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
}
