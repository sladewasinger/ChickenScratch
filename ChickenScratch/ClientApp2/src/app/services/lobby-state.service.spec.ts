import { TestBed } from '@angular/core/testing';

import { LobbyStateService } from './lobby-state.service';

describe('LobbyStateService', () => {
  let service: LobbyStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LobbyStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
