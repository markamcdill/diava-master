import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdditionalVisitorServiceService } from './additional-visitor-service/additional-visitor-service.service';
import { PrivacyActComponent } from '../../shared/privacy-act/privacy-act.component';
import { SSNValidator } from 'src/app/shared/helpers/ssn.validator';


@Component({
  selector: 'app-additional-visitor',
  templateUrl: './additional-visitor.component.html',
  styleUrls: ['./additional-visitor.component.scss']
})
export class AdditionalVisitorComponent implements OnInit {
  ssnHide = true; //Hides input value for SSN

  public _visitorForm: FormGroup;

  constructor(private dialog:MatDialog, 
    private _formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AdditionalVisitorComponent>,
    private _visitorService:AdditionalVisitorServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ssnValidator: SSNValidator) {}

    onNoClick(): void {
      this.dialogRef.close();
  }

  ngOnInit(): void {
    this._visitorForm = this._formBuilder.group({
      ID: [this.data.ID],
      add_visitor_fname: [this.data.add_visitor_fname, Validators.required],
      add_visitor_lname: [this.data.add_visitor_lname, Validators.required],
      add_visitor_ssn: [this.data.add_visitor_ssn, Validators.pattern(this.ssnValidator.ssnPattern)],
      add_visitor_rank_grade: [this.data.add_visitor_rank_grade, Validators.required],
      add_visitor_rp: [this.data.add_visitor_rp, Validators.required],
    });

  }

  onSubmit() {
    //---------------------
    // This is to ensure the form will not save and close before validation
    let validForm = true;

    Object.keys(this._visitorForm.controls).forEach(key => {
      if (this._visitorForm.get(key).errors != null) {
        validForm = false;
      }
    })
    //---------------------

    if (isNaN(this.data.ID) && validForm) { // added && validForm to force form validation so form will not automaically close when save is clicked
      this._visitorService.addVisitor(this._visitorForm.value);
      this.dialogRef.close(); 
    } else if(validForm) { // added if(validForm) to force validation
      this._visitorService.editContact(this._visitorForm.value);
      this.dialogRef.close();
    }

    //----------------------
    //Added if as the last part of the force form validation
    //NOTE: removed the closeAll() statement.
    // 1) removal had no affect on current dialog closing funcationality; the additional visitor dialog closes (normally) and doesn't close if there is an error in the form (on save)
    // 2) closeAll() caused the visit-view dialog, called by manage-reports.component.html, to close (entirely) instead of just closing only the additional visitor dialog 
    if (validForm) {
      // this.dialog.closeAll();
    }
    //----------------------
  }

   //Privacy Act Statement Dialog
   openDialog() {
    const dialogRef = this.dialog.open(PrivacyActComponent);
    //end Privacy Act Statement
  }

}
