import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HubSocketService } from '../services/hub-socket.service';
import { LobbyStateService } from '../services/lobby-state.service';

@Injectable({
  providedIn: 'root'
})
export class GoToLobbyGuard implements CanActivate {
  constructor(
    private router: Router,
    private lobbyStateService: LobbyStateService) {
  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    if (this.lobbyStateService.PlayerIsInLobby) {
      this.router.navigateByUrl('');
      return false;
    }
    return true;
  }
}
