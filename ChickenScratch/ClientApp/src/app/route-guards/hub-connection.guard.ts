import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HubSocketService } from '../services/hub-socket.service';

@Injectable({
  providedIn: 'root'
})
export class HubConnectionGuard implements CanActivate {
  constructor(private hubService: HubSocketService,
    private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.hubService.Connected) {
      this.router.navigate(['']);
    }
    return this.hubService.Connected;
  }
}
