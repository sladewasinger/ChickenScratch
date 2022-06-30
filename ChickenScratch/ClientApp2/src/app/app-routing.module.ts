import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { PreLobbyComponent } from './components/pre-lobby/pre-lobby.component';
import { GoToLobbyGuard } from './route-guards/go-to-lobby.guard';

const routes: Routes = [
  { path: '', component: PreLobbyComponent, canActivate: [GoToLobbyGuard] },
  {
    path: 'lobby/:key', component: LobbyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
