import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { ManageSettingsComponent } from './manage-settings.component';

describe('ManageSettingsComponent', () => {
  let component: ManageSettingsComponent;
  let fixture: ComponentFixture<ManageSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      declarations: [ ManageSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message if from-address for DIAVA emails is not set', ()=> {
    let mail_sender = component.manage_settings.controls['settings_mail_sender'];
    mail_sender.setValue('')
    expect(mail_sender.valid).toBeFalsy();
  })

  it('should show error message if app web address is not set', ()=> {
    let app_url = component.manage_settings.controls['settings_app_url'];
    app_url.setValue('')
    expect(app_url.valid).toBeFalsy();
  })

  it('should show error message if application time out is not set', ()=> {
    let idle_time = component.manage_settings.controls['settings_app_idle_time'];
    idle_time.setValue('')
    expect(idle_time.valid).toBeFalsy();
  })

  it('should show error message if time out duration is not set', ()=> {
    let timeout_duration = component.manage_settings.controls['settings_app_timeout_duration'];
    timeout_duration.setValue('')
    expect(timeout_duration.valid).toBeFalsy();
  })

});
