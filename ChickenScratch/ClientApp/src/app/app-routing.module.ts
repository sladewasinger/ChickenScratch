import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { PreLobbyComponent } from './components/pre-lobby/pre-lobby.component';
import { HubConnectionGuard } from './route-guards/hub-connection.guard';
import { LobbyGameComponent } from './components/lobby-game/lobby-game.component';

const routes: Routes = [
  { path: '', component: PreLobbyComponent },
  {
    path: 'lobby', component: LobbyComponent, canActivate: [HubConnectionGuard]
  },
  {
    path: 'lobby-game', component: LobbyGameComponent, canActivate: [HubConnectionGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
