import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Lobby2Component } from './components/lobby2/lobby2.component';

const routes: Routes = [
  // { path: '', component: PreLobbyComponent, canActivate: [LobbyGuard] },
  {
    path: 'lobbyKey/:key', component: Lobby2Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
