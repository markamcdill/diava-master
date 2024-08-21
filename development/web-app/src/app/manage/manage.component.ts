import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService, User } from "../core/services/user.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  user$:Observable<User>;
  user;

  constructor(svc:UserService, private router: Router) {
    this.user$ = svc.getUser(); //for access control
  }

  ngOnInit() {

    // get the current user
    this.user = this.user$.subscribe(
      val =>{
        this.user = val;
        //Validates access controls -- only maintainers and administrators have access to this page
        if(this.user.user_role == "read-only"){
          this.router.navigate(['./home']);
        }
      }
    )


  }
}