import { TestBed } from '@angular/core/testing';

import { GatepassService } from './gatepass.service';

describe('GatepassService', () => {
  let service: GatepassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GatepassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
