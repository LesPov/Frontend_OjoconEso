import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenunciaAnonimaComponent } from './denuncia-anonima.component';

describe('DenunciaAnonimaComponent', () => {
  let component: DenunciaAnonimaComponent;
  let fixture: ComponentFixture<DenunciaAnonimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenunciaAnonimaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DenunciaAnonimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
