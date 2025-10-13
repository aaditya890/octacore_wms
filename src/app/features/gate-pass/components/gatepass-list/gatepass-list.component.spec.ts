import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GatepassListComponent } from './gatepass-list.component';

describe('GatepassListComponent', () => {
  let component: GatepassListComponent;
  let fixture: ComponentFixture<GatepassListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatepassListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GatepassListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
