import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtiposDeDenunciaComponent } from './subtipos-de-denuncia.component';

describe('SubtiposDeDenunciaComponent', () => {
  let component: SubtiposDeDenunciaComponent;
  let fixture: ComponentFixture<SubtiposDeDenunciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtiposDeDenunciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubtiposDeDenunciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
