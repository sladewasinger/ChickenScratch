import { TestBed } from '@angular/core/testing';

import { HubSocketService } from './hub-socket.service';

describe('HubSocketService', () => {
  let service: HubSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HubSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
