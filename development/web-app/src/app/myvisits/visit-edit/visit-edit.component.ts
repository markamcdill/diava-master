import { Component, OnInit, Inject } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { DateCompare } from 'src/app/shared/helpers/date-compare.validator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdditionalVisitorServiceService } from 'src/app/submitvisit/additional-visitor/additional-visitor-service/additional-visitor-service.service';
import { AdditionalVisitorComponent } from 'src/app/submitvisit/additional-visitor/additional-visitor.component';
import { PrivacyActComponent } from 'src/app/shared/privacy-act/privacy-act.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClearanceDtgValidator } from 'src/app/shared/helpers/clearance-dtg.validator';
import { ZuluValidator } from 'src/app/shared/helpers/zulu.validator';
import { SSNValidator } from 'src/app/shared/helpers/ssn.validator';

@Component({
  selector: 'app-visit-edit',
  templateUrl: './visit-edit.component.html',
  styleUrls: ['./visit-edit.component.scss']
})
export class VisitEditComponent implements OnInit {

  editMode = true;
  isPopupOpened = false; //This will make sure that the popup dialog when adding additional visitors will only display once. Can't open mulitple popups
  formClass = "edit";
  classClass = 'unclass'
  ssnHide = true;
  
  traveler_rp_display;
  visit_create_date_display;
  visit_modify_date_display;
  formTemplate: FormGroup;
  dateNow = new Date();
  dateFormat = 'MMM dd YYYY';
  previousDateError = "Selected Date(s) cannot be previous to " + this.getFormattedDate(this.dateNow, this.dateFormat);
  visitDataOriginal = {}
  additionalVisitorOriginal = []

  constructor(
    private snackBar : MatSnackBar,
    private dialogRef: MatDialogRef<VisitEditComponent>, 
    @Inject(MAT_DIALOG_DATA) public visitData: any, 
    private dialog : MatDialog, 
    private formBuilder: FormBuilder,
    private ssnValidator: SSNValidator,
    private clearanceDtgValidator: ClearanceDtgValidator,
    private zuluValidator: ZuluValidator,
    private _visitorService?: AdditionalVisitorServiceService
    ) {

    for(var key in this.visitData){//capture the original visit data (IN A SEPARATE, UNMODELED OBJECT) for close/cancel action
      this.visitDataOriginal[key] = this.visitData[key]
    }
    this.visitData['additional_visitors'].forEach(additional_visitor => {
      this.additionalVisitorOriginal.push(additional_visitor)
    });
  }

  ngOnInit(): void {
    this.formTemplate = this.formBuilder.group({
      visit_classification : [this.visitData['visit_classification'], Validators.required],
      visit_classification_dissem: [this.visitData['visit_classification_dissem']],
      visit_classification_full : [this.visitData['visit_classification_full']],
      traveler_rp : [this.visitData['traveler_rp'], Validators.required],
      traveler_ssn: [this.visitData['traveler_ssn'], (Validators.required,Validators.pattern(this.ssnValidator.ssnPattern))],
      traveler_dob : [this.visitData['traveler_dob'], Validators.required],
      traveler_dob_display : [this.visitData['traveler_dob_display']],
      traveler_org : [this.visitData['traveler_org'], Validators.required],
      traveler_cac : [this.visitData['traveler_cac']],
      traveler_phone_cell : [this.visitData['traveler_phone_cell'], Validators.required],
      traveler_phone_comm : [this.visitData['traveler_phone_comm'], Validators.required],
      traveler_phone_nsts : [this.visitData['traveler_phone_nsts']],
      traveler_email_niprnet : [this.visitData['traveler_email_niprnet'], Validators.email],
      traveler_email_jwics : [this.visitData['traveler_email_jwics'], (Validators.required, Validators.email)],
      traveler_fname : [this.visitData['traveler_fname'], Validators.required],
      traveler_lname : [this.visitData['traveler_lname'], Validators.required],
      traveler_m_initial : [this.visitData['traveler_m_initial']],
      traveler_city : [this.visitData['traveler_city'], Validators.required],
      traveler_rank_grade : [this.visitData['traveler_rank_grade'], Validators.required],
      traveler_street : [this.visitData['traveler_street'], Validators.required],
      traveler_state : [this.visitData['traveler_state'], Validators.required],
      traveler_country : [this.visitData['traveler_country'], Validators.required],
      traveler_zip : [this.visitData['traveler_zip'], Validators.required],
      location_name : [this.visitData['location_name'], Validators.required],
      visit_id : [this.visitData['visit_id']],
      visit_start_dt : [this.visitData['visit_start_dt'], Validators.required],
      visit_start_dt_display: [this.visitData['visit_start_dt_display']],
      visit_start_time : [this.visitData['visit_start_time'], Validators.pattern(this.zuluValidator.zuluPattern)],
      visit_end_dt : [this.visitData['visit_end_dt'], Validators.required],
      visit_end_dt_display: [this.visitData['visit_end_dt_display']],
      visit_end_time : [this.visitData['visit_end_time'], Validators.pattern(this.zuluValidator.zuluPattern)],
      visit_clearance_msg_dtg : [this.visitData['visit_clearance_msg_dtg'], Validators.pattern(this.clearanceDtgValidator.clearanceDTG)],
      visit_clearance_received: [this.visitData['visit_clearance_received']],
      visit_country_clearance_received: [this.visitData['visit_country_clearance_received']],
      visit_fname : [this.visitData['visit_fname'], Validators.required],
      visit_lname : [this.visitData['visit_lname'], Validators.required],
      visit_rank_grade : [this.visitData['visit_rank_grade'], Validators.required],
      visit_email : [this.visitData['visit_email'],  (Validators.required, Validators.email)],
      visit_phone_comm : [this.visitData['visit_phone_comm']],
      visit_phone_nsts : [this.visitData['visit_phone_nsts']],
      visit_purpose : [this.visitData['visit_purpose'], Validators.required],
      visit_additional_offices : [this.visitData['visit_additional_offices']],
      visit_lodging_name : [this.visitData['visit_lodging_name'], Validators.required],
      visit_lodging_street : [this.visitData['visit_lodging_street'], Validators.required],
      visit_lodging_city : [this.visitData['visit_lodging_city'], Validators.required],
      visit_lodging_state : [this.visitData['visit_lodging_state'], Validators.required],
      visit_lodging_phone : [this.visitData['visit_lodging_phone'], Validators.required],
      visit_lodging_comments : [this.visitData['visit_lodging_comments']],
      visit_submitted_by : [this.visitData['visit_submitted_by']],
      visit_office_name : [this.visitData['visit_office_name'], Validators.required],
      visit_office_city : [this.visitData['visit_office_city']],
      visit_office_country : [this.visitData['visit_office_country']],
      visit_create_date: [this.visitData['visit_create_date']],
      visit_modify_date: [this.visitData['visit_modify_date']],
      on_behalf : [this.visitData['on_behalf'], Validators.required],
      additional_visitors : [this.visitData['additional_visitors']]
    }, {
      validator: DateCompare('visit_start_dt', 'visit_end_dt')
    })
    
    this.setDefaultValues()
  }

  setDefaultValues(){
    this._visitorService.setVisitorList(this.visitData['additional_visitors'])//populate the visitor service with any additional 
    this.setVisitClassificationDisplay()//set the classification display

    //user cannot edit clearance received fields
    this.formTemplate.controls['visit_clearance_received'].disable()
    this.formTemplate.controls['visit_country_clearance_received'].disable()

    // configure the modify date
    if(!this.visitData['visit_modify_date'] || this.visitData['visit_modify_date'] == ""){//no modify date, set it to create date
      this.visitData['visit_modify_date'] = this.visitData['visit_create_date']
    }

    // set display values for create and modify dates
    this.visit_create_date_display = formatDate(this.visitData['visit_create_date'], 'MM/dd/YYYY', 'en-US')
    this.visit_modify_date_display = formatDate(this.visitData['visit_modify_date'], 'MM/dd/YYYY', 'en-US')
  }


  setVisitClassificationDisplay(){//user made a classification change -- set visit_classification_full to reflect (and display) the new value
    var dissem = "//NOFORN"
    if(!this.visitData['visit_classification_dissem']){//visit_classification_dissem == true/false (set the display value)
      dissem = ""
    }
    this.classClass = 'top-secret'//default to TOP SECRET (system high); and because the class selector has a dash in it and doesn't precisely match the visitData['visit_classification']
    if(this.visitData['visit_classification'].toLowerCase() != 'top secret')
    this.classClass = this.visitData['visit_classification'].toLowerCase()
    //display this value
    this.visitData['visit_classification_full'] = this.visitData['visit_classification'] + dissem
  }

  setNoforn(){//user selected a different classification; uncheck and configure the NOFORN checkbox
    this.visitData['visit_classification_dissem'] = false // uncheck NOFORN
    this.formTemplate.controls['visit_classification_dissem'].enable()// default to enabled
    if(this.formTemplate.controls['visit_classification'].value == 'UNCLASSIFIED'){//user selected UNCL; disable the checkbox
      this.formTemplate.controls['visit_classification_dissem'].disable()
    }
    this.setVisitClassificationDisplay()//update the full classification display
  }

  // transform a valid date object (date) into the requested format (format)
  // prepend the text value for the day of week onto the formated date
  getFormattedDate(date: Date, format: string) {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const datePipe = new DatePipe('en-US');
    return weekDays[date.getDay()] + " " + datePipe.transform(date, format);
  }

    // Begin Privacy Act Statement Dialog
    openPAS() {
      const dialogRef = this.dialog.open(PrivacyActComponent);
    }
    // End Privacy Act Statement



  //Begin additional visitor code set
  get VisitorList(){
    return this._visitorService.getAllVisitors();
  }

    // clear the visit object and the additional visitor list
    clearVisit(){
      this._visitorService.clearVisitorList()
    }

  addVisitor() {
    this.isPopupOpened = true;
    const dialogRef = this.dialog.open(AdditionalVisitorComponent, {
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isPopupOpened = false;
    });
  }

  editVisitor(id: number) {
    this.isPopupOpened = true;
    const visitor = this._visitorService.getAllVisitors().find(c => c.ID === id);
    const dialogRef = this.dialog.open(AdditionalVisitorComponent, {
      data: visitor
    });
  
    dialogRef.afterClosed().subscribe(result =>{
      this.isPopupOpened = false;
    });
  }

  deleteVisitor(id: number) {
    this._visitorService.deleteVisitor(id);
  }
  //End additional visitor code set



  submit(){//update visit in ES
    if(this.formTemplate.valid){
      this.dialogRef.close({data: this.visitData, action: 'submit'})//send modified visit data to myvisits component for submission to server
      this.snackBar.open("Record successfully updated and email confirmations sent!", "Ok", {
        duration: 3000,
      });
      this.clearVisit()
    }

  }

  cancel(){//close the dialog and send the original data back to reset the datasource
    this._visitorService.setVisitorList(this.additionalVisitorOriginal)
    this.visitDataOriginal['additional_visitors'] = this.additionalVisitorOriginal
    this.dialogRef.close({data: this.visitDataOriginal,action: 'close'})
    this.clearVisit()
  }

}
