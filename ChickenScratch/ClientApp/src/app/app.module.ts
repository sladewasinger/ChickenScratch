import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreatePlayerFormComponent } from './components/create-player-form/create-player-form.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { MaterialModule } from './material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PreLobbyComponent } from './components/pre-lobby/pre-lobby.component';
import { LobbyGameComponent } from './components/lobby-game/lobby-game.component';
import { JoinLobbyComponent } from './components/pre-lobby/components/join-lobby/join-lobby.component';
import { CreateLobbyComponent } from './components/pre-lobby/components/create-lobby/create-lobby.component';
import { HubSocketService } from 'hubsockets-client';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    CreatePlayerFormComponent,
    PreLobbyComponent,
    LobbyGameComponent,
    JoinLobbyComponent,
    CreateLobbyComponent,
  ],
  entryComponents: [CreatePlayerFormComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FontAwesomeModule,
  ],
  providers: [HubSocketService],
  bootstrap: [AppComponent],
})
export class AppModule {}
