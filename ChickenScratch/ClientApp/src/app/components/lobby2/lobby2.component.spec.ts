import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lobby2Component } from './lobby2.component';

describe('Lobby2Component', () => {
  let component: Lobby2Component;
  let fixture: ComponentFixture<Lobby2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Lobby2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Lobby2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
