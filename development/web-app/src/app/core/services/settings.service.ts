import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Settings{
  settings_id: string;
  settings_mail_server: string;
  settings_mail_sender: string;
  settings_app_url: string;
  settings_app_message: string;
  settings_app_alert_start_dt: string;
  settings_app_alert_end_dt: string;
}

@Injectable({
  providedIn: 'root'
})

export class SettingsService {

  constructor(private http: HttpClient ) {}

  getSettings():Observable<Settings>{
    return this.http.get<Settings>('/diava/getSettings');
  }

  editSettings(settings){
    return this.http.post<Settings>('/diava/editSettings', {"settings":JSON.stringify(settings)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    )
  }
}
