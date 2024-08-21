import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SecurityConsentComponent } from './security-consent.component';

describe('SecurityConsentComponent', () => {
  let component: SecurityConsentComponent;
  let fixture: ComponentFixture<SecurityConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [
        RouterTestingModule
      ],
      declarations: [ SecurityConsentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove the splash screen if security consent is accepted', () => {
    component.acceptSecurity();
    expect(component.showSplash).toBeFalsy();
  });
});
