import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LobbyGameComponent } from './lobby-game.component';

describe('LobbyGameComponent', () => {
  let component: LobbyGameComponent;
  let fixture: ComponentFixture<LobbyGameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LobbyGameComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
