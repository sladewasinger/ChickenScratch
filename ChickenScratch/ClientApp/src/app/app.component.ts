import { Component, OnInit } from '@angular/core';
import { Point } from 'src/app/models/point';
import { HubSocketService } from 'src/app/services/hub-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
  }

}
