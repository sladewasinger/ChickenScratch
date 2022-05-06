import { TestBed } from '@angular/core/testing';

import { HubConnectionGuard } from './hub-connection.guard';

describe('HubConnectionGuard', () => {
  let guard: HubConnectionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HubConnectionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
