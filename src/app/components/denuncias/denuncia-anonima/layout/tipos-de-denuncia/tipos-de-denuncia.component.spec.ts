import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposDeDenunciaComponent } from './tipos-de-denuncia.component';

describe('TiposDeDenunciaComponent', () => {
  let component: TiposDeDenunciaComponent;
  let fixture: ComponentFixture<TiposDeDenunciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposDeDenunciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TiposDeDenunciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
