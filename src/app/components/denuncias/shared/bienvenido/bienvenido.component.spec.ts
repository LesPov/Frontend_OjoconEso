import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiembenidoComponent } from './bienvenido.component';

describe('BiembenidoComponent', () => {
  let component: BiembenidoComponent;
  let fixture: ComponentFixture<BiembenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiembenidoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BiembenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
