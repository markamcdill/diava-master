import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from "../core/services/user.service";
import { Observable } from 'rxjs';

import { PrivacyActComponent } from '../shared/privacy-act/privacy-act.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SSNValidator } from '../shared/helpers/ssn.validator';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss']
})
export class MyaccountComponent implements OnInit {
  user$:Observable<User>;
  user = null;
  my_account = {};
  myAccountForm: FormGroup;

  ssnHide = true; //Hides input value for SSN

  constructor(private svc:UserService, private fb: FormBuilder, private dialog:MatDialog, private snackBar : MatSnackBar, private ssnValidator: SSNValidator) { 
    this.user$ = svc.getUser();
    this.user = this.user$.subscribe(val =>{
      this.user = val
    })
    
    //My Account Form 
    this.myAccountForm = this.fb.group({
      user_rp: [this.user.user_rp, Validators.required],
      user_rank_grade: [this.user.user_rank_grade, Validators.required],
      user_ssn: [this.user.user_cn, Validators.pattern(ssnValidator.ssnPattern)],
      user_cac: [this.user.user_cac],
      user_dob: [this.user.user_dob],
      user_org: [this.user.user_org, Validators.required],
      user_phone_cell: [this.user.user_phone_cell, Validators.required],
      user_phone_comm: [this.user.user_phone_comm, Validators.required],
      user_phone_nsts: [this.user.user_phone_nsts],
      user_email_niprnet: [this.user.user_email_niprnet, Validators.email],
      user_email_jwics: [this.user.user_email_jwics, (Validators.required, Validators.email)]
    });
  }

  ngOnInit(): void {

  }

  submit(){
    if(this.myAccountForm.valid){
      this.svc.editUser(this.user)
      this.snackBar.open("Successfully saved", "Ok", {
        duration: 3000,
      }); 
    }
    else{
      this.snackBar.open("Failed to save", "Ok", {
        duration: 3000,
      }); 
    }   
  }
  

  //begin Privacy Act Statement Dialog
  openPAS() {
    const dialogRef = this.dialog.open(PrivacyActComponent);
  }
  //end Privacy Act Statement
}

