import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable, Subject} from 'rxjs';

export interface Visit{
  visit_id: string;
  visit_create_date: string;
  location_id:string;
  location_name:string;
  user_cn:string;
  user_cac:string;
  user_city:string;
  user_zip: string;
  user_country:string;
  user_dob:string;
  user_email_jwics:string;
  user_email_niprnet:string;
  user_fname:string;
  user_lname:string;
  user_mi:string;
  user_org:string;
  user_phone_cell:string;
  user_phone_comm:string;
  user_phone_nsts:string;
  user_rank_grade:string;
  user_rp:string;
  user_ssn:string;
  user_state:string;
  user_street:string;
  visit_aditional_offices:string;
  visit_classification:string;
  visit_classification_dissem: string;
  visit_classification_full: string;
  visit_clearance_msg_dtg:string;
  visit_email:string;
  visit_end_dt:string;
  visit_end_time:string;
  visit_fname:string;
  visit_lname:string;
  visit_lodging_city:string;
  visit_lodging_comments:string;
  visit_lodging_name:string;
  visit_lodging_phone:string;
  visit_lodging_state:string;
  visit_lodging_street:string;
  visit_phone_comm:string;
  visit_phone_nsts:string;
  visit_purpose:string;
  visit_rank_grade:string;
  visit_start_dt:string;
  visit_start_time:string;  
}



@Injectable({
  providedIn: 'root'
})
export class VisitService {

  _visits:Subject<any> = new BehaviorSubject<any>(null);
  visits = this._visits.asObservable();

  _allVisits:Subject<any> = new BehaviorSubject<any>(null);
  allVisits = this._allVisits.asObservable();

  constructor(private http: HttpClient) {}

  createVisit(visitRequest){
    return this.http.post<Visit>('/diava/createVisit', {"visit_obj":JSON.stringify(visitRequest)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    )
  }

  updateVisit(visitObj) {
    return this.http.post<Visit>('/diava/updateVisit', { "visit_obj": JSON.stringify(visitObj)}).subscribe(
      res => {
      },
      err => {
        console.log(err);
      }
    )
  }

  getVisists() : Observable<Visit[]> {
    return this.http.get<Visit[]>('/diava/getVisits');
  }

  getVisitsByUser() : Observable<Visit[]> {
    return this.http.get<Visit[]>('/diava/getVisitsByUser')
  }
  
  exportVisits(visit_data) {
    return this.http.post('/diava/exportVisits', visit_data, { responseType : 'blob'});
  }

  // exportExcel(visit_data){
  //   console.log("visit service visit_data: ", visit_data)
  //   return this.http.post('/diava/exportExcel', visit_data, { responseType : 'blob'});
  // }

  // exportExcel(visit_data) {
  //   return this.http.post('/diava/exportExcel', { "visit_data": JSON.stringify(visit_data), responseType : 'blob'}).subscribe(
  //     res => {
  //        console.log("visit_data posted: ", res);
  //     },
  //     err => {
  //       console.log(err);
  //     }
  //   )
  // }

  sendEmail(visitRequest){
    return this.http.post<Visit>('/diava/sendEmail', {"visitRequest": JSON.stringify(visitRequest)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    );
  }

  searchVisits(search_data){
    return this.http.post<Visit[]>('/diava/searchVisits', {"search_data":JSON.stringify(search_data)}).subscribe(
      res=>{
        this._visits.next(res)
      },
      err=>{
        console.log(err);
      }
    )
  }

  deleteVisit(visit){
    return this.http.post<Visit>('/diava/deleteVisit', {"visit":JSON.stringify(visit)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    )
  }

}


