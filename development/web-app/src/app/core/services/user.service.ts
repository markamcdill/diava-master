import { HttpClient} from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { mergeMap } from 'rxjs/operators';


export interface User{
  id: string;
  user_cn: string;
  user_dn: string;
  user_ssn: string;
}

@Injectable({
  providedIn: 'root'
})

export class UserService {

  _users:Subject<any> = new BehaviorSubject<any>(null);
  users = this._users.asObservable();
  _admins:Subject<any> = new BehaviorSubject<any>(null);
  admins = this._admins.asObservable();
  nameParts;
  fName;
  lName;
  mName;
  dNum;
  


  constructor(private http: HttpClient){}

  getUser():Observable<User>{
    return this.http.get<User>('/diava/user').pipe(mergeMap(userMap=> {
      if (userMap === null) {
        return throwError('')
      }
      else {
        return of(userMap)
      }
    }))
  }

  getCurrentUser(){
    return this.http.get<User>('/diava/currentUser');
  }


  chkSoleAdmin(user):Observable<User>{//check if this is the only admin at a location
   return this.http.post<User>('/diava/chkSoleAdmin', {"user":JSON.stringify(user)})
  }

  chkSoleMaintainer(user):Observable<User>{//check if this is the only maintainer for the app
    return this.http.post<User>('/diava/chkSoleMaintainer', {"user":JSON.stringify(user)})
   }

  getUsers(filter){
    return this.http.post<User[]>('/diava/getUsers', {"search_data":filter}).subscribe(
      res=>{
        this._users.next(res)
      },
      err=>{
        console.log(err);
      }
    )
  }

  getAdmins(){
    return this.http.post<User[]>('/diava/getAdmins', {"search_data": "**"}).subscribe(
      res=>{
        this._admins.next(res)
      },
      err=>{
        console.log(err);
      }
    )
  }

  editUser(user){
    return this.http.post<User>('/diava/updateUser', {"user":JSON.stringify(user)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    )
  }

  deleteUser(user){
    return this.http.post<User>('/diava/deleteUser', {"user":JSON.stringify(user)}).subscribe(
      res=>{
      },
      err=>{
        console.log(err);
      }
    )
  }

  // extract user's first name, last name, middle initial, and d-number from user_cn
  // return discrete name parts as a JSON object
  getNameParts(cn){
    this.nameParts = cn.split(" ")
    
    this.lName = this.nameParts[0]
    this.fName = this.nameParts[1]
    // some users may not have a middle initial
    if(this.nameParts.length > 3){// four values found, middle initial is number 3 value
      this.mName = this.nameParts[2]
      this.dNum = this.nameParts[3]
    }
    else{// only three values (no middle intial); set middle initial to DoD standard 'NMI'
      this.mName = 'NMI'
      this.dNum = this.nameParts[2]
    }
    
     return JSON.parse('{"first_name": "'+this.fName+'", "last_name": "'+this.lName+'", "middle_initial": "'+this.mName+'", "d_number": "'+this.dNum+'"}')

  }

}
