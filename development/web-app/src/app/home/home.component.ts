import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService, User } from "../core/services/user.service";
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user$:Observable<User>;
  user;
  getStarted = true;
  showAlert = false; //default alert message to no-show
  alertMsg = ""
  welcomeMsg = ""
  settings$
  settings;
  
  constructor(svc:UserService, private settingsService: SettingsService){
    this.user$ = svc.getUser();
    // get today
    let today: Date = new Date();

    // zeroize the time for comparison to 'whole days' placed in settings (ES)
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    //get the start/end date from manage-settings
    this.settings$ = this.settingsService.getSettings();
    this.settings = this.settings$.subscribe(val =>{
      this.settings = val[0]
      let settingsStartDate = new Date(this.settings['settings_app_alert_start_dt'])
      let settingsEndDate = new Date(this.settings['settings_app_alert_end_dt'])
      this.alertMsg = this.settings['settings_app_alert_message']
      this.welcomeMsg = this.settings['settings_app_welcome_message']

      // compare settings start/end to 'today'
      if(settingsStartDate <= today  && today <= settingsEndDate){
        this.showAlert = true // show the alert message
      }
    })
  }

  ngOnInit() {
    this.user = this.user$.subscribe(
      val =>{
        this.user = val;
      }
    )
  }

  setGetStarted(){
    this.getStarted = false
  }
}
