import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutDetailsComponent } from './in-out-details.component';

describe('InOutDetailsComponent', () => {
  let component: InOutDetailsComponent;
  let fixture: ComponentFixture<InOutDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InOutDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
