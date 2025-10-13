import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndentListComponent } from './indent-list.component';

describe('IndentListComponent', () => {
  let component: IndentListComponent;
  let fixture: ComponentFixture<IndentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndentListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
