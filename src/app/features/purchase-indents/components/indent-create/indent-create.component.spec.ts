import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndentCreateComponent } from './indent-create.component';

describe('IndentCreateComponent', () => {
  let component: IndentCreateComponent;
  let fixture: ComponentFixture<IndentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndentCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
