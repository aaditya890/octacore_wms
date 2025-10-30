import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatepassReceiptComponent } from './gatepass-receipt.component';

describe('GatepassReceiptComponent', () => {
  let component: GatepassReceiptComponent;
  let fixture: ComponentFixture<GatepassReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatepassReceiptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GatepassReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
