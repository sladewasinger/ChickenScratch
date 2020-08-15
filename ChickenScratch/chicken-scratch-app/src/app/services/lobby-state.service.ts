import { Injectable } from '@angular/core';
import { LobbyState } from '../models/lobbyState';
import { Subject, Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { HubSocketService } from './hub-socket.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyStateService {
  lobbyState: LobbyState;

  private lobbyStateStream = new ReplaySubject<LobbyState>(1); /*<LobbyState>{
    lobbies: [],
    players: []
  });*/

  constructor(private hubSocketService: HubSocketService) {
    this.hubSocketService.listenOn<LobbyState>("LobbyStateUpdated").subscribe(x => this.updateLobbyState(x));
  }

  getLobbyState(): Observable<LobbyState> {
    return this.lobbyStateStream.asObservable();
  }

  private updateLobbyState(lobbyState: LobbyState) {
    this.lobbyStateStream.next(lobbyState);
  }
}
