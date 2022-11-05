import { Inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { HubSocketService } from 'hubsockets-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HubConnectionGuard implements CanActivate {
  constructor(
    @Inject(HubSocketService) private hubService: HubSocketService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.hubService.Connected) {
      console.log('Not connected to hub - redirecting.');
      this.router.navigate(['']);
    }
    return this.hubService.Connected;
  }
}
