import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatepassVerifyComponent } from './gatepass-verify.component';

describe('GatepassVerifyComponent', () => {
  let component: GatepassVerifyComponent;
  let fixture: ComponentFixture<GatepassVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatepassVerifyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GatepassVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
