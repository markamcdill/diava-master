import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/core/services/user.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';
import { AlertDateValidator } from 'src/app/shared/helpers/alert-date-validator';

@Component({
  selector: 'app-manage-settings',
  templateUrl: './manage-settings.component.html',
  styleUrls: ['./manage-settings.component.scss']
})
export class ManageSettingsComponent implements OnInit {
  curUser$:Observable<User>;
  curUser;
  settings$
  settings;
  manage_settings: FormGroup;
  invalidForm: any;

  constructor(private router: Router, private usr_svc:UserService, private formBuilder: FormBuilder, private snackBar : MatSnackBar, private settingsService: SettingsService) { 
    this.curUser$ = this.usr_svc.getUser();
    this.settings$ = settingsService.getSettings();
    this.settings = this.settings$.subscribe(val =>{
      this.settings = val[0]
      if(!this.settings){//no data in ES -- cannot set a form with an empty array (no JSON); must have at least an empty JSON
        // use this as a place holder for the form until data is placed in the util-index/settings doc_type
        this.settings = {}
      }
    })
  }

  ngOnInit(): void {
    // get the current user
    this.curUser = this.curUser$.subscribe(
      val =>{
        this.curUser = val;
        //Validates access controls -- only maintainers have access to this page
        if(this.curUser.user_role == "read-only" || this.curUser.user_role == "administrator"){
          this.router.navigate(['./home']);
        }
      }
    )
    this.manage_settings = this.formBuilder.group({
      settings_mail_sender: [this.settings.settings_mail_sender, [Validators.required, Validators.email]],
      settings_app_url: [this.settings.settings_app_url, Validators.required],
      settings_app_alert_message: [this.settings.settings_app_alert_message, Validators.pattern(/^[a-zA-Z0-9!?@#$%^&*.,;:\-' "()]+$/)],
      settings_app_welcome_message: [this.settings.settings_app_welcome_message, Validators.pattern(/^[a-zA-Z0-9!?@#$%^&*.,;:\-' "()]+$/)],
      settings_app_alert_start_dt: [this.settings.settings_app_alert_start_dt],
      settings_app_alert_end_dt: [this.settings.settings_app_alert_end_dt],
      settings_app_idle_time: [this.settings.settings_app_idle_time, [Validators.min(1), Validators.required]],
      settings_app_timeout_duration: [this.settings.settings_app_timeout_duration, [Validators.min(1), Validators.required]]
      },
      {validator: AlertDateValidator('settings_app_alert_message', 'settings_app_alert_start_dt')}
    )
  }

  submit(){
    if (this.manage_settings.valid) {
      var msg;
        msg = "Settings successfully updated. May need to refresh browser for settings to take affect."
        
      this.invalidForm = null;
      this.settingsService.editSettings(this.settings)
      this.snackBar.open(msg, "Ok", {
        duration: 3000,
        //panelClass: 'snackbar-msg-icon'
      });
    }
    else {
      this.invalidForm = "Message cannot contain certian characters. These are a few examples that are not allowed \{ < = [ / + _ ";
    }
  };
  
}
