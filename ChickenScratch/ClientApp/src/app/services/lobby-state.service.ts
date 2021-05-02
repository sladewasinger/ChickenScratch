import { Injectable } from '@angular/core';
import { LobbyState } from '../models/lobbyState';
import { Subject, Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { HubSocketService } from './hub-socket.service';
import { Player } from '../models/player';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LobbyStateService {
  private myPlayerStream = new ReplaySubject<Player>(1);
  private lobbyStateStream = new ReplaySubject<LobbyState>(1);
  private isInLobby = false;

  constructor(private hubSocketService: HubSocketService,
    private router: Router) {
    this.hubSocketService.listenOn<LobbyState>("LobbyStateUpdated").subscribe(x => this.updateLobbyState(x));
    this.hubSocketService.onDisconnect().subscribe(x => this.onDisconnect(x));
  }

  get PlayerIsInLobby() {
    return this.isInLobby;
  }

  getLobbyState(): Observable<LobbyState> {
    return this.lobbyStateStream.asObservable();
  }

  updateMyPlayer(player: Player) {
    this.myPlayerStream.next(player);
  }

  getMyPlayer(): Observable<Player> {
    return this.myPlayerStream.asObservable();
  }

  private onDisconnect(e) {
    console.log("Lobby service - hub disconnected");
    this.updateMyPlayer(null);
    this.updateLobbyState(null);
    this.isInLobby = false;
    this.router.navigate(['']);
  }

  private updateLobbyState(lobbyState: LobbyState) {
    this.isInLobby = true;
    this.lobbyStateStream.next(lobbyState);
  }
}
