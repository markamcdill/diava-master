import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DateCompare } from '../shared/helpers/date-compare.validator';
import { VisitService } from '../core/services/visit.service';
import { AdditionalVisitorServiceService } from './additional-visitor/additional-visitor-service/additional-visitor-service.service';
import { AdditionalVisitorComponent } from './additional-visitor/additional-visitor.component';
import { MatStepper } from '@angular/material/stepper';
import { LocationsService } from "../core/services/locations.service";
import { PrivacyActComponent } from '../shared/privacy-act/privacy-act.component';
import { UserService, User } from "../core/services/user.service";
import { SettingsService, Settings } from '../core/services/settings.service';
import { Observable } from 'rxjs';
import UUID from 'uuid';
import { ClearanceDtgValidator } from '../shared/helpers/clearance-dtg.validator';
import { SSNValidator } from '../shared/helpers/ssn.validator';
import { ZuluValidator } from '../shared/helpers/zulu.validator';



@Component({
  selector: 'app-submitvisit',
  templateUrl: './submitvisit.component.html',
  styleUrls: ['./submitvisit.component.scss']
})

export class SubmitvisitComponent implements OnInit {

  //user$;
  user$:Observable<User>;
  admins;
  emailRecipients = {"adminEmails": [], "traveler_email_jwics": "", "onbehalf_submitted_by_email_jwics": "", "visit_email": ""}
  user;
  settings$:Observable<Settings>
  settings;
  visit_request = {};
  travelDestinationStep: FormGroup;
  travelDatesStep: FormGroup;
  travelerInfoStep: FormGroup;
  officeVisitingStep: FormGroup;
  lodgingStep: FormGroup;
  addVisitorsStep: FormGroup;
  ssnHide = true; //Hides input value for SSN
  nofornDisabled = true; //Disables the classification noforn checkbox
  isPopupOpened = false; //This will make sure that the popup dialog when adding additional visitors will only display once. Can't open mulitple popups
  locations=[];
  destination$;
  destination;
  destinationCnfMsg;
  destinationWelcomeMsg;
  destinationWelcomeMsgShort;
  shortMsg = true; //toggle short or long message
  showCnf = false; //toggle confirmation message
  more = false; //toggle '...more or ...less' statment in the welcome message
  showWelcomeMsgDiv = false; //show the initial welcome message div element (initialized false, set true when a location is selected)
  nameParts;
  // traveler's name (parts) get set from nameParts in the onBehalf() method
  traveler_first_name;
  traveler_middle_initial;
  traveler_last_name;
  //readOnly = ""

  // pre-filled visit for testing --- DO NOT DELETE the line below ----
  // visit = {"traveler_street": "123 Easy St", "traveler_city":"Paradise", "traveler_zip":"64006", "traveler_state":"CA", "traveler_country":"USA", "visit_start_dt":"2022-09-16", "visit_end_dt":"2022-09-21", "visit_start_time":"0700", "visit_end_time":"1400", "traveler_fname":"Mark", "traveler_m_initial":"A.", "traveler_lname":"McDill", "traveler_rp":"no", "traveler_rank_grade":"GG-13", "traveler_ssn":"123-45-6789", "traveler_cac":"G34562H3", "traveler_dob":"2000-12-25", "traveler_org":"Disney", "traveler_phone_cell":"400-569-5690", "traveler_phone_comm":"401-235-5487", "traveler_phone_nsts":"9801254", "traveler_email_niprnet":"Jenny@gmail.com", "traveler_email_jwics":"jenny@gmail.com", "visit_classification":"UNCLASSIFIED", "visit_classification_dissem":false, "visit_clearance_msg_dtg":"", "visit_office_name":"Corrections", "visit_fname":"Snuffy", "visit_lname":"Smith", "visit_rank_grade":"PFC", "visit_email":"snuffy.smith@podunk.mil", "visit_phone_comm":"402-987-9874", "visit_phone_nsts":"269-9854-9854", "visit_purpose":"visit an old buddy", "visit_additional_offices":"Also visiting office1 and office2", "visit_lodging_name":"The Brig", "visit_lodging_street":"Hard Labor Ave", "visit_lodging_city":"Leavanworth", "visit_lodging_state":"Misery (MI)", "visit_lodging_phone":"1800GETMEOUT", "visit_lodging_comments":"Bring your own soap"}

  // blank/empty visit -- real world
  visit = {"traveler_street": "", "traveler_city":"", "traveler_zip":"", "traveler_state":"", "traveler_country":"", "visit_start_dt":"", "visit_end_dt":"", "visit_start_time":"", "visit_end_time":"", "traveler_fname":"", "traveler_m_initial":"", "traveler_lname":"", "traveler_rp":"", "traveler_rank_grade":"", "traveler_ssn":"", "traveler_cac":"", "traveler_dob":"", "traveler_org":"", "traveler_phone_cell":"", "traveler_phone_comm":"", "traveler_phone_nsts":"", "traveler_email_niprnet":"", "traveler_email_jwics":"", "visit_classification":"", "visit_classification_dissem":"", "visit_clearance_msg_dtg":"", "visit_office_name":"", "visit_fname":"", "visit_lname":"", "visit_rank_grade":"", "visit_email":"", "visit_phone_comm":"", "visit_phone_nsts":"", "visit_purpose":"", "visit_additional_offices":"", "visit_lodging_name":"", "visit_lodging_street":"", "visit_lodging_city":"", "visit_lodging_state":"", "visit_lodging_phone":"", "visit_lodging_comments":""}


  @ViewChild('stepper') stepper: MatStepper; //Used to link review form (step 6) so that each step has an edit link tied to the stepper


  constructor(private visitService:VisitService, private svcUser:UserService, private svcLocation:LocationsService, private _formBuilder: FormBuilder, private dialog:MatDialog, private settingsService: SettingsService, private clearanceDtgValidator: ClearanceDtgValidator, private ssnValidator: SSNValidator, private zuluValidator: ZuluValidator, private _visitorService?: AdditionalVisitorServiceService) {

    // this.user$ = svcUser.getUser().subscribe(val => {
    //   this.user = val
    //   this.nameParts = this.svcUser.getNameParts(this.user.user_cn)
    // });
    this.svcUser.getAdmins()
    this.svcUser._admins.subscribe((value) => {
      this.admins = value;
    });

    this.user$ = svcUser.getUser();
    this.user = this.user$.subscribe(val =>{
      this.user = val
      this.nameParts = this.svcUser.getNameParts(this.user.user_cn)
    });

    this.svcLocation.getLocations();
    this.svcLocation._locations.subscribe((value) => {
      this.locations = value;  
    }); 

    this.settings$ = settingsService.getSettings();
    this.settings = this.settings$.subscribe(val =>{
      this.settings = val[0]
    })
  }
  
  ngOnInit() {


    //Travel Destination Step
    this.travelDestinationStep = this._formBuilder.group({
      location_name: [null, Validators.required],
      editLocationName: [null],
      on_behalf: [null, Validators.required]
    });
    
    
    
    // the form objects below are populated with data from 'this.visit'
    //Travel Dates Step
    this.travelDatesStep = this._formBuilder.group({
      traveler_street: [this.visit['traveler_street'], Validators.required],
      traveler_city: [this.visit['traveler_city'], Validators.required],
      traveler_zip: [this.visit['traveler_zip'], Validators.required],
      traveler_state: [this.visit['traveler_state'], Validators.required],
      traveler_country: [this.visit['traveler_country'], Validators.required],
      visit_start_dt: [this.visit['visit_start_dt'], Validators.required],
      visit_start_dt_display: [],
      visit_end_dt: [this.visit['visit_end_dt'], Validators.required],
      visit_end_dt_display: [],
      visit_start_time: [this.visit['visit_start_time'], Validators.pattern(this.zuluValidator.zuluPattern)],
      visit_end_time: [this.visit['visit_end_time'], Validators.pattern(this.zuluValidator.zuluPattern)]
    }, {
      validator: DateCompare('visit_start_dt', 'visit_end_dt')
    });

    //Traveler Info Step 
    this.travelerInfoStep = this._formBuilder.group({
      traveler_fname: [this.visit['traveler_fname'], Validators.required],
      traveler_m_initial: [this.visit['traveler_m_initial']],
      traveler_lname: [this.visit['traveler_lname'], Validators.required],
      traveler_rp: [this.visit['traveler_rp'], Validators.required],
      traveler_rank_grade: [this.visit['traveler_rank_grade'], Validators.required],
      traveler_ssn: [this.visit['traveler_ssn'], (Validators.required,Validators.pattern(this.ssnValidator.ssnPattern))],
      traveler_cac: [this.visit['traveler_cac']],
      traveler_dob: [this.visit['traveler_dob'], Validators.required],
      traveler_dob_display: [],
      traveler_org: [this.visit['traveler_org'], Validators.required],
      traveler_phone_cell: [this.visit['traveler_phone_cell'], Validators.required],
      traveler_phone_comm: [this.visit['traveler_phone_comm'], Validators.required],
      traveler_phone_nsts: [this.visit['traveler_phone_nsts']],
      traveler_email_niprnet: [this.visit['traveler_email_niprnet'], Validators.email],
      traveler_email_jwics: [this.visit['traveler_email_jwics'], (Validators.required, Validators.email)]
    });
    
    //Office Visiting Step
    this.officeVisitingStep = this._formBuilder.group({
      visit_classification: [this.visit['visit_classification'], Validators.required],
      visit_classification_dissem: [this.visit['visit_classification_dissem']],
      visit_clearance_msg_dtg: [this.visit['visit_clearance_msg_dtg'], Validators.pattern(this.clearanceDtgValidator.clearanceDTG)],
      visit_office_name: [this.visit['visit_office_name'], Validators.required],
      visit_office_city: [this.visit['visit_office_city']],
      visit_office_country: [this.visit['visit_office_country']],
      visit_fname: [this.visit['visit_fname'], Validators.required],
      visit_lname: [this.visit['visit_lname'], Validators.required],
      visit_rank_grade: [this.visit['visit_rank_grade'], Validators.required],
      visit_email: [this.visit['visit_email'], (Validators.required, Validators.email)],
      visit_phone_comm: [this.visit['visit_phone_comm']],
      visit_phone_nsts: [this.visit['visit_phone_nsts']],
      visit_purpose: [this.visit['visit_purpose'], Validators.required],
      visit_additional_offices: [this.visit['visit_additional_offices']]
    });
  
    
    //Lodging Step
    this.lodgingStep = this._formBuilder.group({
      visit_lodging_name: [this.visit['visit_lodging_name'], Validators.required],
      visit_lodging_street: [this.visit['visit_lodging_street'], Validators.required],
      visit_lodging_city: [this.visit['visit_lodging_city'], Validators.required],
      visit_lodging_state: [this.visit['visit_lodging_state'], Validators.required],
      visit_lodging_phone: [this.visit['visit_lodging_phone'], Validators.required],
      visit_lodging_comments: [this.visit['visit_lodging_comments']]
    });

  }

  // toggle event to configure traveler info as 'on behalf' of another user
  onBehalf(){
    
    
    if(this.travelDestinationStep.controls['on_behalf'].value == "Yes"){//clear the current user's personal info and create a jwics email input for the 'on behalf' traveler
      // set the traveler's name (parts) from values filled out in the form
      this.traveler_first_name = this.travelerInfoStep.controls['traveler_fname'].value
      this.traveler_middle_initial = this.travelerInfoStep.controls['traveler_m_initial'].value
      this.traveler_last_name = this.travelerInfoStep.controls['traveler_lname'].value

      // add the traveler's jwics email form control to this form group and set validators
      this.travelDestinationStep.addControl('onbehalf_submitted_by_email_jwics', new FormControl(this.user.user_email_jwics))
      this.travelDestinationStep.controls['onbehalf_submitted_by_email_jwics'].setValidators([Validators.required, Validators.email])

      // enable traveler's name controls and set readOnly label blank
      this.travelerInfoStep.controls['traveler_fname'].enable()
      this.travelerInfoStep.controls['traveler_m_initial'].enable()
      this.travelerInfoStep.controls['traveler_lname'].enable()
      // this.readOnly = ""
      
      //clear current user's info from travel date steps (don't clear the dates)
      this.travelDatesStep.controls['traveler_street'].setValue('')
      this.travelDatesStep.controls['traveler_city'].setValue('')
      this.travelDatesStep.controls['traveler_zip'].setValue('')
      this.travelDatesStep.controls['traveler_state'].setValue('')
      this.travelDatesStep.controls['traveler_country'].setValue('')

      // clear current user's info from traveler info step
      for(var control in this.travelerInfoStep.controls){
        this.travelerInfoStep.controls[control].setValue('')
      }
    }
    else{//restore the current user's personal info (from ES) and configure the form
      // set the traveler's name (parts) from 'nameParts' since values are not provided in the form
      var nameParts = this.svcUser.getNameParts(this.user.user_cn)
      this.traveler_first_name = nameParts['first_name']
      this.traveler_middle_initial = nameParts['middle_initial']
      this.traveler_last_name = nameParts['last_name']
      this.travelDestinationStep.removeControl('onbehalf_submitted_by_email_jwics') // remove this form control
      this.setForm()
    }
  }

  //set current user' personal info in the form(s) from ES
  setForm(){ 
    // // NOTE: this.user is populated with data from ES (NOT the visit object defined on this page)
    // travelDatesStep
    this.visit['traveler_street'] = this.user.user_street
    this.visit['traveler_city'] = this.user.user_city
    this.visit['traveler_zip'] = this.user.user_zip
    this.visit['traveler_state'] = this.user.user_state
    this.visit['traveler_country'] = this.user.user_country

    this.travelDatesStep.controls['traveler_street'].setValue(this.user.user_street)
    this.travelDatesStep.controls['traveler_city'].setValue(this.user.user_city)
    this.travelDatesStep.controls['traveler_zip'].setValue(this.user.user_zip)
    this.travelDatesStep.controls['traveler_state'].setValue(this.user.user_state)
    this.travelDatesStep.controls['traveler_country'].setValue(this.user.user_country)

    // DO NOT use patchValue on travelDatesStep; it will clear out date values that need to be retained in the form
    // this.travelDatesStep.patchValue(this.visit) //update form with this.user's values
    

    // travelerInfoStep 
    // this.readOnly = "(read only)"
    this.visit['traveler_fname'] = this.nameParts['first_name']
    this.travelerInfoStep.controls['traveler_fname'].disable()
    this.visit['traveler_m_initial'] = this.nameParts['middle_initial']
    this.travelerInfoStep.controls['traveler_m_initial'].disable()
    this.visit['traveler_lname'] = this.nameParts['last_name']
    this.travelerInfoStep.controls['traveler_lname'].disable()
    this.visit['traveler_rp'] = this.user.user_rp
    this.visit['traveler_rank_grade'] = this.user.user_rank_grade
    this.visit['traveler_ssn'] = this.user.user_ssn
    this.visit['traveler_cac'] = this.user.user_cac
    this.visit['traveler_dob'] = this.user.user_dob
    this.visit['traveler_org'] = this.user.user_org
    this.visit['traveler_phone_cell'] = this.user.user_phone_cell
    this.visit['traveler_phone_comm'] = this.user.user_phone_comm
    this.visit['traveler_phone_nsts'] = this.user.user_phone_nsts
    this.visit['traveler_email_niprnet'] = this.user.user_email_niprnet
    this.visit['traveler_email_jwics'] = this.user.user_email_jwics
    
    this.travelerInfoStep.patchValue(this.visit) // update form with this.user's values
    
  }

  // set the location name for the edit display
  setLocationDisplayName(){
    // in order to capture the location name as well as the location id in the form, the travelDestinationStep.value
    // is set with a concatenation of location_name and location_id (location_name:location_id) and evaluated
    // on the server for final placement in ES (we need the original location name stored with the visit)
    // however, the Review and Submit edit section should only display the location_name (not the concatenated value)
    // this method extracts the location_name and sets a 'temp' form value (editLocationName) for display
    this.travelDestinationStep.controls['editLocationName'].setValue(this.travelDestinationStep.value['location_name'].split(":")[0])
    this.getDestinationMsgs() //get this location's confirmation and welcome messages
  }

  // get the destination's welcome and confirmation messages and show the welcome message
  getDestinationMsgs(){
    this.more = false
    // retrieve the selected location by ID (extract ID from selected value)
    this.destination$ = this.svcLocation.getLocation(this.travelDestinationStep.value['location_name'].split(":")[1]).subscribe( val =>{
    this.destination = val
    // set local messages from location object
    this.destinationCnfMsg = this.destination.location_conf_msg
    this.destinationWelcomeMsgShort = this.mkShortMsg(this.destination.location_welcome_msg)
    this.destinationWelcomeMsg = this.destination.location_welcome_msg
    // display the welcome message
    this.showWelcomeMsgDiv = true;
    })
  }

  tglWelcomeMsg(){
    if(this.shortMsg){
      this.shortMsg = false
    }
    else{
      this.shortMsg = true
    }
  }

  mkShortMsg(msg){
    if(this.destination.location_welcome_msg){
      if(msg.length > 80){
        msg = msg.substring(0,80)
        this.more = true;
      }
      else{
        this.more = false
      }
      return msg
    }
    return ""
  }

  setNoforn(){
    //console.log("this.officeVisitingStep.controls['visit_classification_dissem'].value: ", this.officeVisitingStep.controls['visit_classification_dissem'].value)
    this.officeVisitingStep.controls['visit_classification_dissem'].setValue(false)
  }

  // modify the arrival/departure/user dob date formats for display on the Review & Submit step
  // Day DD/mm/YYYY
  setDateDisplay(){
    const dateFormat = 'MMM dd YYYY'
    if(this.travelDatesStep.controls['visit_start_dt'].value != ""){//arrival date
      let visitStartDate = new Date(this.travelDatesStep.controls['visit_start_dt'].value.toString())//create a date object
      this.travelDatesStep.controls['visit_start_dt_display'].setValue(this.getFormattedDate(visitStartDate, dateFormat))//set the display value in the correct format
    }

    if(this.travelDatesStep.controls['visit_end_dt'].value != ""){//departure date
      let visitEndDate = new Date(this.travelDatesStep.controls['visit_end_dt'].value.toString())//create a date object
      this.travelDatesStep.controls['visit_end_dt_display'].setValue(this.getFormattedDate(visitEndDate, dateFormat))//set the display value in the correct format
    }
    
    if(this.travelerInfoStep.controls['traveler_dob'].value){//user date of birth
      let dobDate = new Date(this.travelerInfoStep.controls['traveler_dob'].value.toString())//create a date object
      this.travelerInfoStep.controls['traveler_dob_display'].setValue(this.getFormattedDate(dobDate, dateFormat))//set the display value in the correct format
    }
    this.travelDatesStep.updateValueAndValidity()
  }

  // transform a valid date object (date) into the requested format (format)
  // prepend the text value for the day of week onto the formated date
  getFormattedDate(date: Date, format: string) {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const datePipe = new DatePipe('en-US');
    return weekDays[date.getDay()] + " " + datePipe.transform(date, format);
  }

  // Submit a Visit Request
  // transform data from form 'steps' into a flat JSON object for ES
  // update requestor's personal info 
  submit(){
    this.visit_request["travelDestination"] = this.travelDestinationStep.value;
    this.visit_request["travelerInfo"] = this.travelerInfoStep.value;
    this.visit_request["travelDates"] = this.travelDatesStep.value;
    this.visit_request["officeVisiting"] = this.officeVisitingStep.value;
    this.visit_request["lodging"] = this.lodgingStep.value;
  
    var visitRequest = {}//flat JSON object for ES

    // set the traveler's name from their CN
    // when the current user is the traveler, First/Last/Middle fields disabled (read only); use name parts from CN
    // when the current user is submitting on behalf of someone else, they are forced to fill in First/Last/Middle
    if(this.travelDestinationStep.controls['on_behalf'].value == 'No'){
      visitRequest['traveler_fname'] = this.nameParts['first_name']
      visitRequest['traveler_m_initial'] = this.nameParts['middle_initial']
      visitRequest['traveler_lname'] = this.nameParts['last_name']
    }
  
    // extract/transform all the 'step values' into a flat json object for ES
    for(var stepObj in this.visit_request){//iterate each major step (stepObj)
      var subObj = this.visit_request[stepObj]//extract all key/values (subObj) within a major step
      for(var subEl in subObj){//iterate each subObj key/value
        visitRequest[subEl] = subObj[subEl] // create a flat JSON object with key/value pairs in subObj
      }
    }
    


    
    // capture the additional information and place in the visitRequest
    visitRequest["additional_visitors"] = this._visitorService.getAllVisitors()//log additional visitors
    visitRequest['visit_submitted_by'] = this.user.user_cn // log this user as the requestor
    visitRequest['visit_status'] = "NEW" // set the request status
    visitRequest['visit_clearance_msg_dtg'] = ""
    visitRequest['visit_clearance_received'] = "no"
    visitRequest['visit_country_clearance_received'] = "no"
    
    
    
    //remove these items from request (for display only)
    delete visitRequest['editLocationName']
    // delete visitRequest['visit_start_dt_display']
    // delete visitRequest['visit_end_dt_display']
    // delete visitRequest['traveler_dob_display']

    
    visitRequest['visit_id'] = UUID.v4() // createt the visit_id here since it is needed in the email
    visitRequest = this.setEmailRecipients(visitRequest) // set admin emails at location destination and all other emails
    

    // send the visit request
    this.visitService.createVisit(visitRequest)//submit this visit request

    visitRequest['settings'] = this.settings
    // send out the emails
    this.visitService.sendEmail(visitRequest)
    

    // clear out 
    this.clearVisit()
    
    this.showCnf = true; // show the confirmation message for this location
  
    if(this.travelDestinationStep.controls['on_behalf'].value == "No"){
      // update this user with unique info found in visit request
      this.user['user_fname'] = visitRequest['traveler_fname']
      this.user['user_m_initial'] = visitRequest['traveler_m_initial']
      this.user['user_lname'] = visitRequest['traveler_lname']
      this.user['user_rp'] = visitRequest['traveler_rp']
      this.user['user_street'] = visitRequest['traveler_street']
      this.user['user_city'] = visitRequest['traveler_city']
      this.user['user_zip'] = visitRequest['traveler_zip']
      this.user['user_state'] = visitRequest['traveler_state']
      this.user['user_country'] = visitRequest['traveler_country']
      this.user['user_cac'] = visitRequest['traveler_cac']
      this.user['user_rank_grade'] = visitRequest['traveler_rank_grade']
      this.user['user_ssn'] = visitRequest['traveler_ssn']
      this.user['user_dob'] = visitRequest['traveler_dob']
      this.user['user_org'] = visitRequest['traveler_org']
      this.user['user_phone_cell'] = visitRequest['traveler_phone_cell']
      this.user['user_phone_comm'] = visitRequest['traveler_phone_comm']
      this.user['user_phone_nsts'] = visitRequest['traveler_phone_nsts']
      this.user['user_email_niprnet'] = visitRequest['traveler_email_niprnet']
      this.user['user_email_jwics'] = visitRequest['traveler_email_jwics']
      
      this.svcUser.editUser(this.user)//update this user's profile
    }

  }

  //set all the email recipients in the visit request in a new visitRequest key (emailRecipients)
  // admin emails at location/destination
  // traveler's email
  // visit email (local poc)
  // on behalf (submitter on behalf) email
  setEmailRecipients(visitRequest){
    
    var location_id = visitRequest['location_name'].split(":")[1]//parse out the location_id
    var adminEmails = []
    var onBehalfEmail = ""

    //visit on behalf, place the submitter's email address in here
    if(visitRequest['on_behalf'] == 'Yes'){
      onBehalfEmail = visitRequest['onbehalf_submitted_by_email_jwics']
    }
    
    //capture all admins at this location_id and set in emailRecipients array
    this.admins.forEach(admin => {
      if(admin.location_id == location_id){
        adminEmails.push(admin.user_email_jwics)
      }
    });

    this.emailRecipients['adminEmails'] = adminEmails
    this.emailRecipients['traveler_email_jwics'] = visitRequest['traveler_email_jwics']
    this.emailRecipients['visit_email'] = visitRequest['visit_email']
    this.emailRecipients['onbehalf_submitted_by_email_jwics'] = onBehalfEmail

    visitRequest['emailRecipients'] = this.emailRecipients

    
    
    return visitRequest
  }

  // clear the visit object and the additional visitor list
  clearVisit(){
    for (const key in this.visit){
      this.visit[key] = ""
    }
    this._visitorService.clearVisitorList()
  }

   //Begin additional visitor code set
  get VisitorList(){
    return this._visitorService.getAllVisitors();
  }

  addVisitor() {
    this.isPopupOpened = true;
    const dialogRef = this.dialog.open(AdditionalVisitorComponent, {
      data: {}
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

  //Used to link review to edit step 
  move(index: number) {
    this.stepper.selectedIndex = index;
  }

  cancel(){//clear the additional visitor list; reactr to all cancel buttons on visit request
    this._visitorService.clearVisitorList()
  }


  // Begin Privacy Act Statement Dialog
  openPAS() {
    const dialogRef = this.dialog.open(PrivacyActComponent);
  }
  // End Privacy Act Statement

}