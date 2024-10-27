import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenunciaOficialComponent } from './denuncia-oficial.component';

describe('DenunciaOficialComponent', () => {
  let component: DenunciaOficialComponent;
  let fixture: ComponentFixture<DenunciaOficialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenunciaOficialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DenunciaOficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
