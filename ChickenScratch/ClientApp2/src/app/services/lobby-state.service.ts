import { Injectable } from '@angular/core';
import { LobbyState } from '../models/lobbyState';
import { Observable, ReplaySubject } from 'rxjs';
import { HubSocketService } from './hub-socket.service';
import { Player } from '../models/player';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LobbyStateService {
  private myPlayerStream = new ReplaySubject<Player | null>(1);
  private lobbyStateStream = new ReplaySubject<LobbyState | null>(1);
  private isInLobby = false;

  constructor(private hubSocketService: HubSocketService,
    private router: Router) {
    this.hubSocketService.listenOn<LobbyState>("LobbyStateUpdated").subscribe(x => this.updateLobbyState(x));
    this.hubSocketService.onDisconnect().subscribe(x => this.onDisconnect(x));
  }

  get PlayerIsInLobby() {
    return this.isInLobby;
  }

  getLobbyState(): Observable<LobbyState | null> {
    return this.lobbyStateStream.asObservable();
  }

  private updateLobbyState(lobbyState: LobbyState | null) {
    this.isInLobby = true;
    this.lobbyStateStream.next(lobbyState);
  }

  getMyPlayer(): Observable<Player | null> {
    return this.myPlayerStream.asObservable();
  }

  updateMyPlayer(player: Player | null) {
    this.myPlayerStream.next(player);
  }

  private onDisconnect(e: any) {
    console.log("Lobby service - hub disconnected");
    this.updateMyPlayer(null);
    this.updateLobbyState(null);
    this.isInLobby = false;
    this.router.navigate(['']);
  }
}
