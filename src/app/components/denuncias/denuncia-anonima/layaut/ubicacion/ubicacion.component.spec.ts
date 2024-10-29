import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbicacionComponent } from './ubicacion.component';

describe('UbicacionComponent', () => {
  let component: UbicacionComponent;
  let fixture: ComponentFixture<UbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbicacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
