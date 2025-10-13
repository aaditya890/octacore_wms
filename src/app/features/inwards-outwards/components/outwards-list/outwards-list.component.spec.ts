import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutwardsListComponent } from './outwards-list.component';

describe('OutwardsListComponent', () => {
  let component: OutwardsListComponent;
  let fixture: ComponentFixture<OutwardsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutwardsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OutwardsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
