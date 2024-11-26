import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordrecoveryComponent } from './passwordrecovery.component';

describe('PasswordrecoveryComponent', () => {
  let component: PasswordrecoveryComponent;
  let fixture: ComponentFixture<PasswordrecoveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordrecoveryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PasswordrecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
