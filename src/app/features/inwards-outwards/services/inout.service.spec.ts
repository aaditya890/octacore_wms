import { TestBed } from '@angular/core/testing';
import { InoutService } from './inout.service';

describe('InoutService', () => {
  let service: InoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
