import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HubResponse } from 'src/app/models/hubResponse';
import { LobbyState } from 'src/app/models/lobbyState';
import { HubSocketService } from 'src/app/services/hub-socket.service';
import { LobbyStateService } from 'src/app/services/lobby-state.service';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/models/player';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePlayerFormComponent } from '../create-player-form/create-player-form.component';

@Component({
  selector: 'app-lobby2',
  templateUrl: './lobby2.component.html',
  styleUrls: ['./lobby2.component.scss']
})
export class Lobby2Component implements OnInit {
  lobbyKey: string;
  subs: Subscription[] = [];
  myPlayer: Player;

  constructor(private route: ActivatedRoute,
    private hubSocketService: HubSocketService,
    private lobbyStateService: LobbyStateService,
    private router: Router,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.lobbyKey = this.route.snapshot.paramMap.get('key');
    console.log("Lobby Key: ", this.lobbyKey);

    this.subs.push(
      this.lobbyStateService.getMyPlayer().subscribe(p => {
        this.myPlayer = p;
      })
    );

    this.modalService.open(CreatePlayerFormComponent);
  }

  async ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }

  async joinLobby() {
    try {
      var response = await this.hubSocketService.sendWithPromise<HubResponse<LobbyState>>("joinLobby", {
        lobbyKey: this.lobbyKey
      });

      if (!response.isSuccess) {
        throw response;
      }

      this.router.navigate(['lobby']);
    }
    catch (error) {
      console.log("join lobby failed:", error);
    }
  }
}
