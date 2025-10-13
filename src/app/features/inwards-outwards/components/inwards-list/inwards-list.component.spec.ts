import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InwardsListComponent } from './inwards-list.component';

describe('InwardsListComponent', () => {
  let component: InwardsListComponent;
  let fixture: ComponentFixture<InwardsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InwardsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InwardsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
