import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenciaComponent } from './evidencia.component';

describe('EvidenciaComponent', () => {
  let component: EvidenciaComponent;
  let fixture: ComponentFixture<EvidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvidenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EvidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
