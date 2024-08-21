import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAnalyticsComponent } from './manage-analytics.component';

describe('ManageAnalyticsComponent', () => {
  let component: ManageAnalyticsComponent;
  let fixture: ComponentFixture<ManageAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAnalyticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
