import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/core/services/user.service';
import { LocationsService } from 'src/app/core/services/locations.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable} from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-msg-welcome',
  templateUrl: './manage-msg-welcome.component.html',
  styleUrls: ['./manage-msg-welcome.component.scss']
})
export class ManageMsgWelcomeComponent implements OnInit {
  user$:Observable<User>;
  user;
  location$;
  location;
  locations = []
  welcomeMsgForm: FormGroup;
  invalidForm : string;
  locationAssigned = false;

  constructor(private usrSvc: UserService, private locSvc: LocationsService, 
    private _formBuilder: FormBuilder, private router: Router, private snackBar : MatSnackBar) { 

    this.location =  {}
    
    this.user$ = this.usrSvc.getUser() // return an observable user
    
    this.location$ = this.user$.pipe(first(),  // use pipe to transform observable (user$) to usable data
      switchMap( val => {  //use switchMap to syncronize observables (user$ and location$)
        if(!val['location_id']){
          console.log("NO LOCATION FOUND: add new location and assign a maintainer to a location to enable this page")
          this.location$.unsubscribe()
        }
        else{
          return this.locSvc.getLocation(val['location_id'])  // return an observable location (for this user)
        }
        
      })
    ).subscribe(ret=> { // subscribe to this location (ret == the return from switchMap())
      return this.location = ret
    })
    
    this.welcomeMsgForm = this._formBuilder.group({
      welcome_message: [null, Validators.pattern(/^[a-zA-Z0-9!?@#$%^&*.,;:\-' "()]+$/)]
    });

    this.locSvc.getLocations();
    this.locSvc._locations.subscribe((value) => {
      this.locations = value;  
    });
    
  }

  ngOnInit(): void {
    // get the current user
    this.user = this.user$.subscribe(
      val =>{
        this.user = val;
        //Validates access controls -- only maintainers and administators have access to this page
        if(this.user.user_role == "read-only" || this.user.user_role == "maintainer"){
          this.router.navigate(['./home']);
        }
      }
    )
  }

  submit(){
    if (this.welcomeMsgForm.valid) {
      var msg;

      if(this.locations.length > 0){
        this.locSvc.editLocation(this.location)
        msg = "Welcome message successfully saved"
      }
      else{
        msg = "WARNING!  Welcome Message Not Updated"
      }
      this.invalidForm = null;
      this.snackBar.open(msg, "Ok", {
        duration: 3000,
        // panelClass: ['success-snackbar']
      });
    }
    else {
      this.invalidForm = "Welcome message cannot contain certian characters. These are a few examples that are not allowed \{ < [ / + _ ";
    }
  };

  btnCancel() {
    this.router.navigateByUrl('/manage');
  };
  
}
