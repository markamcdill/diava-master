import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyActComponent } from './privacy-act.component';

describe('PrivacyActComponent', () => {
  let component: PrivacyActComponent;
  let fixture: ComponentFixture<PrivacyActComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivacyActComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyActComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
