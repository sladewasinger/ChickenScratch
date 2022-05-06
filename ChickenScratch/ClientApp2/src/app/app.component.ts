import { Component } from '@angular/core';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { HubResponse } from 'src/app/models/hubResponse';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  subs: Subscription[] = [];
  totalPlayerCount: number = 0;

  constructor(private hubSocketService: HubSocketService) { }

  async ngOnInit() {
    this.subs.push(
      this.hubSocketService.onDisconnect().subscribe(x => this.onDisconnect())
    );

    await this.tryConnect();
  }

  ngAfterViewInit() {
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  async tryConnect() {
    console.log("attempting connect");
    try {
      await this.hubSocketService.doConnect("wss://" + window.location.hostname + ":443/ws");
      await this.onConnected();
      console.log("Connected!");
    } catch (error) {
      console.log("ERROR connecting to hub socket service: ", error);
    }
  }

  get connected() {
    return this.hubSocketService.Connected;
  }

  async onConnected() {
    const hubResponse = await this.hubSocketService.sendWithPromise<HubResponse<number>>("GetTotalPlayerCount", {});
    const count = hubResponse.data;
    this.totalPlayerCount = count;
  }

  async onDisconnect() {
    console.log("ondisconnected");
    await this.tryConnect();
  }
}
