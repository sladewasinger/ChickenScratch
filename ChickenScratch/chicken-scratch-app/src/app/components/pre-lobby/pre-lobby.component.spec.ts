import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreLobbyComponent } from './pre-lobby.component';

describe('PreLobbyComponent', () => {
  let component: PreLobbyComponent;
  let fixture: ComponentFixture<PreLobbyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreLobbyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
