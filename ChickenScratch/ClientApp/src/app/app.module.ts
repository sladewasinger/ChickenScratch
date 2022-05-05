import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { PreLobbyComponent } from './components/pre-lobby/pre-lobby.component';
import { LobbyGameComponent } from './components/lobby-game/lobby-game.component';
import { Lobby2Component } from './components/lobby2/lobby2.component';
import { CreatePlayerFormComponent } from './components/create-player-form/create-player-form.component';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    PreLobbyComponent,
    LobbyGameComponent,
    Lobby2Component,
    CreatePlayerFormComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
