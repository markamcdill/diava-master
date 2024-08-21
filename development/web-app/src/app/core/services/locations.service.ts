import { HttpClient} from '@angular/common/http';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
import { Injectable } from '@angular/core';

export interface Location{
  id: string;
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  _locations:Subject<any> = new BehaviorSubject<any>(null);
  locations = this._locations.asObservable();
  _location:Subject<any> = new BehaviorSubject<any>(null);
  location = this._location.asObservable();

  constructor(private http: HttpClient) {}

  getLocations(){
    return this.http.post<Location[]>('/diava/getLocations', {}).subscribe(
      res=>{
        this._locations.next(res)
      },
      err=>{
        console.log(err);
      }
    )
  }


  createLocation(location){
    return this.http.post<Location>('/diava/createLocation', {"location":JSON.stringify(location)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    )
  }


  // get a specific location by ID
  getLocation(location_id):Observable<Location>{
    return this.http.post<Location>('/diava/getLocation', {"location_id":JSON.stringify(location_id)})
  }


  editLocation(location){
    return this.http.post<Location>('/diava/updateLocation', {"location":JSON.stringify(location)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    )
  }

}
