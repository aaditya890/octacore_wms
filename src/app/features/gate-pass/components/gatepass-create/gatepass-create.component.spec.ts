import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatepassCreateComponent } from './gatepass-create.component';

describe('GatepassCreateComponent', () => {
  let component: GatepassCreateComponent;
  let fixture: ComponentFixture<GatepassCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatepassCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GatepassCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
