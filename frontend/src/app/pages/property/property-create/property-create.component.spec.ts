import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCreateComponent } from './property-create.component';

describe('PropertyCreate', () => {
  let component: PropertyCreateComponent;
  let fixture: ComponentFixture<PropertyCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
