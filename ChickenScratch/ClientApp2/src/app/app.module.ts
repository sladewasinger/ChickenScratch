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

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    CreatePlayerFormComponent,
    PreLobbyComponent
  ],
  entryComponents: [
    CreatePlayerFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
