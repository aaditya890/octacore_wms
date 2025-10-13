import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutTransactionsComponent } from './in-out-transactions.component';

describe('InOutTransactionsComponent', () => {
  let component: InOutTransactionsComponent;
  let fixture: ComponentFixture<InOutTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutTransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InOutTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
