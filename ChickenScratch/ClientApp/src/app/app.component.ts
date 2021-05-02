import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Point } from 'src/app/models/point';
import { HubSocketService } from 'src/app/services/hub-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  constructor() {

  }

  ngAfterViewInit() {
    var siteWidth = 600; // in index.html
    var scale = screen.width / siteWidth;

    document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=' + siteWidth + ', initial-scale=' + scale + '');
    console.log("changing scale to : " + scale);
  }

}
