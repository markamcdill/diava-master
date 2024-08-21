import { Component, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

import { SettingsService, Settings } from './core/services/settings.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  @ViewChild('timeOutResetDialog') timeOutResetDialog: TemplateRef<any>;
  
  currentPath: String;
  title = 'diava';
  idleState = '';
  timedOut = false;
  //timeOutTime = 20//amount of time (duration in seconds) alloted for the time out warning dialogue
  settings$:Observable<Settings>
  settings;
  
  constructor(private idle: Idle, private dialog: MatDialog, location: Location, private router: Router, private settingsService: SettingsService) {
    this.settings$ = this.settingsService.getSettings();
    this.settings = this.settings$.subscribe(val =>{
      this.settings = val[0]
      // sets an idle timeout
      idle.setIdle(parseInt(this.settings.settings_app_idle_time));//duration of idle time before session expiration
      // sets a timeout period of inactivity then user will be considered timed out.
      idle.setTimeout(parseInt(this.settings.settings_app_timeout_duration));
      // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
      idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

      idle.onTimeout.subscribe(() => {//this is called at the end of the countdown
        this.timedOut = true;
        window.location.reload();
      });

      idle.onTimeoutWarning.subscribe((countdown) => {
        this.idleState = ''+ countdown +'';
        if(countdown > parseInt(this.settings.settings_app_timeout_duration) - 1){//only open the dialogue once (on the first second of the countdown)
          let dialogRef = this.dialog.open(this.timeOutResetDialog, { panelClass: 'custom-dialog-container-timeout' });
          dialogRef.disableClose = true; //dialog backdrop clicking disabled
        }

      });
    })


    // Lets check the path everytime the route changes, stop or start the idle check as appropriate.
    this.router.events.subscribe((val) => {

      this.currentPath = location.path();
      if(this.currentPath.search(/security_consent/gi) == -1)
          idle.watch();
      else
          idle.stop();
    });
  }

  reset() {
    this.idle.watch();
    this.timedOut = false;
    this.dialog.closeAll();
  }

  signIn() {
    this.idle.watch();
    this.timedOut = false;
    this.dialog.closeAll();
    window.location.reload();
  } 
}







