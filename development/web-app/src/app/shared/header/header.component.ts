import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService, User } from "../../core/services/user.service";
import { Router } from '@angular/router';
import { VisitService } from 'src/app/core/services/visit.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],

})

@Injectable()
export class HeaderComponent implements OnInit {
  user$:Observable<User>;
  user;
  mobileClass:Boolean=true;
  locationLabel = 'no location assigned'
  disableLabel = ""
  adminAtSymbol = ""
  showAdminAt = false
  // user.location_name ? user.location_name : 'no location assigned'
 

  constructor(svc:UserService, private router:Router, private visitService : VisitService) {
    this.user$ = svc.getUser();
  }

  ngOnInit() {
    this.mobileClass=true;
    
    this.user = this.user$.subscribe(
      val =>{
        this.user = val;
        if(this.user['location_name']){
          this.locationLabel = this.user['location_name']
          if(this.user['location_active'] == 'no'){
            this.disableLabel = " (disabled)"
          }
        }
        if('adminAt' in this.user){
          this.adminAtSymbol = ""
          this.showAdminAt = false
          if(this.user.adminAt){
            this.adminAtSymbol = "@"
            this.showAdminAt = true
          }
        }
      }
    )
  }

  //begin mobile menu toggle when window resized < 650px
  toggleMobile(){
    if(this.mobileClass==true) {
      this.mobileClass=false;
    }
    else {
      this.mobileClass=true;
    }
  }
  //end mobile menu toggle 
}
