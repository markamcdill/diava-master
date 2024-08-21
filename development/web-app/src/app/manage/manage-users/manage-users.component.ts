import { AfterViewInit, Component, ViewChild, TemplateRef } from '@angular/core';
import { DatePipe } from '@angular/common'
import { UserService, User} from "../../core/services/user.service";

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';

import { LocationsService } from "../../core/services/locations.service";
import { Observable } from 'rxjs';

import { Router } from '@angular/router';



@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
  providers: [DatePipe]
})

export class ManageUsersComponent implements AfterViewInit {
  @ViewChild('nodeDialog') nodeDialog: TemplateRef<any>;
  @ViewChild('delNodeDialog') delNodeDialog: TemplateRef<any>;
  @ViewChild('adminDelNodeDialog') adminDelNodeDialog: TemplateRef<any>;
  @ViewChild('soleAdminNodeDialog') soleAdminNodeDialog: TemplateRef<any>;
  @ViewChild('noLocationsDialog') noLocationsDialog: TemplateRef<any>;
  
 
  curUser$:Observable<User>;
  curUser;
  admins$;
  admins=[];
  // locationRequired = ""
  soleAdmin$:Observable<User>
  soleAdmin = false;
  soleMaintainer$:Observable<User>
  soleMaintainer = false;
  soleMaintainerMsg = false;
  // role_selection;
  now = new Date().getTime();
  years = 2;
  expireValue = 24 * 3600 * 365 * 1000 * this.years;
  // 31536000000 == 1 year in milli
  // 63072000000 == 2 years in milli
  showUserEmailJwics = false;
  showAdminAt = false;
  adminAt = false;
  adminAtShow = false;
  adminAtMsg = " Assume Administrative Privileges at a Selected Location";

  editUser; // user's information modeled and displayed in the _editUser form
  user;  // user's information from ES (in table/row)
  users=[];
  locations=[];
  displayedColumns: string[] = ['user_cn', 'location_name', 'user_role', 'last_active', 'edit', 'delete'];
  // tableLayout: "fixed";
  dataSource: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public _editUser: FormGroup;
  user_cn: any;
  user_role: any;
  location_id: any;
  user_email_jwics: any;
  

  public _deleteUser: FormGroup;


  constructor(
    private user_svc:UserService, 
    private svcLocation:LocationsService, 
    private dialog: MatDialog, 
    private _formBuilder: FormBuilder, 
    private router: Router, 
    private datePipe: DatePipe,
    private snackBar : MatSnackBar) {

    this.curUser$ = user_svc.getUser();
    this.user_svc.getUsers(""); // get all the users for the user table
    
    this.user_svc._users.subscribe((value) => {
      this.users = value;
      if(this.users){
        this.dataSource = new MatTableDataSource(this.users); 
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });

    this.svcLocation.getLocations(); // get all the locations
    this.svcLocation._locations.subscribe((value) => {
      this.locations = value;
    }); 

    this.user_svc.getAdmins()
    this.user_svc._admins.subscribe(val =>{
      this.admins = val
    });
    

  }

  ngOnInit(): void {
    // get the current user
    this.curUser = this.curUser$.subscribe(
      val =>{
        this.curUser = val;
        //Validates access controls -- only maintainers (or adminAt) have access to this page
        if((this.curUser.user_role == "read-only" || this.curUser.user_role == "administrator") && !this.curUser.adminAt){
          this.router.navigate(['./home']);
        }
      }
    )

    // build the editUser form group and set user_role required 
    this._editUser = this._formBuilder.group({
      user_cn: [this.user_cn],
      user_role: [this.user_role, Validators.required],
      location_id: [this.location_id],
      user_email_jwics: [this.user_email_jwics]
    });
    // build the deleteUser form group
    this._deleteUser = this._formBuilder.group({
      user_cn: [this.user_cn]
    });
  }

  ngAfterViewInit() {}

  onSubmit(){ // update/edit this user
    // this.getFormValidationErrors()
    if(this._editUser.valid){
      this.locations.forEach(location=>{ // set the location name associated with this location_id
        if(location.location_id == this.editUser.location_id){
          this.editUser.location_name = location.location_name;
          this.setLocationValidation(this.editUser, location)
        }
      })
      if(this.editUser.location_id == null){// location values cannot be null; if null set to blank
        this.editUser.location_id = ''
        this.editUser.location_name = ''
      }
      
      this.user_svc.editUser(this.editUser);
      
      if(this.curUser.id == this.editUser.id){
        if('adminAt' in this.editUser){
          window.location.reload()
        }
      }
      var idx = -1
      // update user in the table
      this.dataSource.data.forEach(usr => {//find this user in the list and replace with editUser
        idx+=1
        if(usr.id == this.editUser.id){
          this.dataSource.data.splice(idx, 1, this.editUser)
          this.dataSource._updateChangeSubscription() // update the table
          return
        }
      })
      this.dialog.closeAll(); 
      this.snackBar.open("Successfully updated!", "Ok", {
        duration: 3000
      });

    }
  }

  // setLocationValidation()
  //  Set this location's validation status
  //    Valid location == 'active' with an administrator assigned
  //    As user's are modified, all locations need to be re-validated
  setLocationValidation(editUser,location){
    location['location_valid'] = 'no'//location not valid until re-validated
    if(editUser.user_role == 'administrator' && location.location_active == 'yes'){//location is active and this user assigned as administrator 
      location['location_valid'] = 'yes'//location is valid
    }
    else{//either user is not an administrator or location is not active
      if(location.location_active == 'yes'){//location is acive; check if another admin user assigned
        this.admins.forEach(admin =>{
          if(admin.location_id == location.location_id){
            location['location_valid'] = 'yes'//a different user(admin) is assigned; location is valid
          }
        });
      }
    }
    this.svcLocation.editLocation(location);//update location validation status
  }

  applyFilter(event: Event) {  // search filter
    const filterValue = (event.target as HTMLInputElement).value;
    this.user_svc.getUsers(filterValue.trim().toLowerCase());
    if (this.dataSource && this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // updateUser()
  //  Examines the user object passed from table/row data (on edit) for the following:
  //    1) Check if this user is the sole maintainer on the site; if yes, configure _editUser form and show dialogue accordingnly
  //    2) Check if this user is the sole administrator at their location; if yes, show soleAdmin dialogue
  //  Creates a separate editUser object ** the editUser object is modeled to the _editUser form **
  //  Configures the _editUser form based on editUser's profile
  //  Responds to:
  //    Edit selection of a user listed in table/row
  updateUser(user){
    this.user = user// capture the original user information
    this.checkSoleMaintainer(user)//check if user is the only maintianer on the site and configure form display/controls accordingly
    this.checkSoleAdmin(user)// check if user is the only administrator at a location and display the correct dialogue
    this.setEditUser(user) // create the editUser object for the _editUser form
    this.setAdminAtProfile() // 
    this.configForm(null)//initialize _editUser form based on editUser object values
  }

  // setEditUser()
  //  Create a copy of the selected user and maintain it in the editUser object
  //  The editUser object is an exact copy of, but separate from, the user object selected for edit
  //    All user modification actions (from the _editUser form) will take place on the editUser object
  //    If modifications are saved, the editUser object is submitted, the database and table/row are updated accordingly
  //    If modifications are cancelled, the user object is 'untouched'; and original user information remains in table/row
  setEditUser(user){
    this.editUser = {} // create an empty editUser object
    for(var key in user){// create a new profile (not modeled to table/row data)
      this.editUser[key] = user[key]
    }
  }

  // tglAdminAt()
    // Toggles this.adminAt (true/false)
    //  * Only presented to maintainers *
    // Calls setAdminAt and configForm to implement the 'new' adminAt status
    //  Modifies: this.adminAt
    //  Responds To:
    //    adminAt Checkbox in _editUser form
    //      Checked == true
    //        true == maintainer acting as an administrator at a selected location
    //      UnChecked == false
    //        false == user in maintainer role
    //  Initiates setAdminAtProfile and configForm
  tglAdminAt(){
    if(this.adminAt){//set back to false
      this.adminAt = false;
    }
    else{//set to true
      this.adminAt = true
    }
    this.editUser['adminAt'] = this.adminAt
    this.setAdminAtProfile()// set the editUser profile with role and location information
    this.configForm(null)// configure the form controls and validation requirements based on editUser profile
  }

  // setAdminAtProfile()
    // Set this.editUser profile according to this.adminAt status
    //  Modifies: this.editUser
    //  Operates On:  maintainers only
    //  Responds To:
    //    tglAdminAt()
    //    updateUser()
    //  Function(s): modify role and location values based on _editUser form role selection and adminAt toggle status
    //  *NOTE*  The presence of an adminAt key in the user's profile indicates maintainer -- but their active role is administrator
    //          In other words, a maintainer will be placed in the administrator role but will have an adminAt key in their profile
    //          Having the adminAt key in their profile will cue the code to allow placement back into the maintainer role
    //          Maintainers 'may have' the adminAt key whereas administrators 'may not have' an adminAt key
    //  Scenarios
    //    1) maintainer with adminAt key in their profile
    //        adminAt == true
    //          set this.editUser role to 'administrator'
    //        adminAt == false
    //          restore maintainer role and set location values
    //            if 'user' has location set, leave it set
    //            else set location to blank
    //    2) not a maintainer (no adminAt key)
    //        do nothing
  setAdminAtProfile(){
    if('adminAt' in this.editUser){//this function only operates on maintainers with the adminAt key in their profile
      this.adminAt = this.editUser.adminAt//set the adminAt checkbox to their current status (checked/uncheck)

      if(this.adminAt){// make this user an admin
        this.editUser.user_role = 'administrator'
      }
      else{// restore as a maintainer and remove from location (if no location stored in user object)
        this.editUser.user_role = 'maintainer' // put user back to original role and location
        this._editUser.controls['user_role'].setValue('maintainer')// set the form control
        // blank out location values IF no location values stored in USER object; otherwise leave it
        if(!this.user.location_id){
          if('location_id' in this.editUser){
            this.editUser.location_id = ''
          }
          if('location_name' in this.editUser){
            this.editUser.location_name = ''
          }
        }
      }
    }
  }

  // configForm()
    // Configure the edit user form for all scenarios based on the editUser profile
    //  Modifies: _editUser form control displays and validation requirements
    //            defaults to read-only configuration: no validation requirements, option to select a location
    //  Responds to
    //    1) updateUser() initialization
    //    2) user_role selection(s) in _editUser form
    //    3) tglAdminAt()
    //  Scenarios
    //    1)  read-only (default)
    //          required fields: none
    //          controls: user_role, location
    //    2)  administrator
    //          required fields: location, jwics_email
    //          controls: user_role, location, jwics_email
    //    3)  maintainer
    //          required fields: none
    //          controls: user_role, location, adminAt
    //    4)  adminAt
    //          required fields: location, jwics_email
    //          controls: user_role, location, jwics_email, adminAt

  configForm(event){
    // default form to a read-only user display; no adminAt checkbox, no location or jwics_email required
    this.clearValidationRequirements()//no validation required
    this.showAdminAt = false // do not show adminAt checkbox
    this.showUserEmailJwics = false; // do not show user_email_jwics

    var role = this.editUser.user_role // get the role from editUser profile

    // event not null indicates a role selection from drop down
    if(event){//a new role has been selected from the drop down; determine role and set default adminAt status accordingly
      role = this._editUser.controls['user_role'].value // set role to the value selected in the form
      this.adminAt = false// uncheck the adminAt checkbox (default)
      this.editUser['adminAt'] = this.adminAt // place adminAt key in editUser profile
      // determine if maintainer NOT selected
      if (role != 'maintainer'){//maintainer role not selected from drop down; remove the adminAt key from this profile
        delete this.editUser['adminAt']
      }
    }
    // _editUser form will reflect a maintainer IF
    //  1) Current role is maintainer
    //  2) Selected role is maintainer
    //  3) adminAt key in profile
    
    if(role == 'maintainer' || 'adminAt' in this.editUser){// this is a maintainer; show adminAt checkbox
      this.showAdminAt = true // display the adminAt checkbox
      
      if(this.adminAt){// maintainer currently in adminAt role (require a location selection)
        // set the proper location requirement
        this._editUser.controls['location_id'].setValidators(Validators.required)
        if(this._editUser.controls['location_id'].value == null || this._editUser.controls['location_id'].value == ''){
          // since location isn't always required in all scenarios, error must be set true under these conditions
          this._editUser.controls['location_id'].setErrors({'required': true})
        }
        this.showUserEmailJwics = true // show the email input
        this._editUser.controls['user_email_jwics'].setValidators([Validators.required,Validators.email])
        this.adminAtMsg = " Uncheck to restore Maintainer role";
      }
      else{//adminAt is false, no location requirement
        this._editUser.controls['location_id'].setValue(null)
        this.showUserEmailJwics = false // remove the email input
        this.adminAtMsg = " Assume administrative privileges at a selected location";
      }
    }
    // user is an administrator (not a maintainer with adminAt privieleges)
    else if(role == 'administrator' && !this.editUser['adminAt']){// this is an administrator; require location and jwics_email
      // set the proper jwics_email and location requirement
      this.showUserEmailJwics = true // show the email input
      this._editUser.controls['user_email_jwics'].setValidators([Validators.required,Validators.email])
      if(this.adminAt){
        this._editUser.controls['location_id'].setValidators(Validators.required)
        this._editUser.controls['location_id'].setErrors({'required': true})
      }

    }

  }

  // Remove/Zeroize all validation requirements from updateUser form
  //  this defaults the form for read-only profile
  clearValidationRequirements(){
    this._editUser.controls['location_id'].clearValidators()
    this._editUser.controls['location_id'].setErrors({})
    this._editUser.controls['location_id'].markAsUntouched()
    this._editUser.controls['location_id'].updateValueAndValidity()
    this._editUser.controls['user_email_jwics'].clearValidators()
    this._editUser.controls['user_email_jwics'].setErrors({})
    this._editUser.controls['user_email_jwics'].markAsUntouched()
    this._editUser.controls['user_email_jwics'].updateValueAndValidity()
  }

  


  // checkSoleMaintainer()
  //  Checks:
  //   This user (NOT editUser) whether or not they are the only account with with maintainer privileges
  //  Responds to
  //    updateUser() initialization
  //  EDIT
  //  if they are a maintainer and soleMaintainer is true, disable user role selection
  //  and provide a message stating why it cannot be modified
  //  DELETE
  //  show message why they cannot be deleted 
  checkSoleMaintainer(user){
    this.soleMaintainer = false
    this.soleMaintainerMsg = false
    this._editUser.controls['user_role'].enable()
    this.soleMaintainer$ = this.user_svc.chkSoleMaintainer(user)//use this user's credentials to access ES for soleMaintainer query
    this.soleMaintainer$.subscribe(
      val => {
        this.soleMaintainer = val['soleMaintainer']//true or false
        if(this.soleMaintainer && user.user_role == 'maintainer'){//only one maintainer account and this account is 'the' maintainer
          this._editUser.controls['user_role'].disable()//cannot change user_role
          this.soleMaintainerMsg = true//display message why; NOTE: soleMaintainerMsg is also used as a logic switch denoting 'sole maintainer' condition
        }
      }
    )
  }
  // checkSoleAdmin()
  //  Checks:
  //   This user (NOT editUser) whether or not they are the only administrator at a location
  //   The existance of any locations
  //  Responds to
  //    updateUser() initialization
  //  If sole admin at a location
  //    Show message stating why this account may not be edited
  checkSoleAdmin(user){
    
    // check if this is the only admin (soleAdmin) at this location
    // if soleAdmin, do not allow edit until there is another admin at this location
    if (user.user_role == 'administrator' && !user['adminAt']){
      this.soleAdmin$ = this.user_svc.chkSoleAdmin(user)
      this.soleAdmin$.subscribe(
        val => {
          this.soleAdmin = val['soleAdmin']

          if (this.soleAdmin){//this is the only admin at this location; show the soleAdmin dialogue
            let dialogRef = this.dialog.open(this.soleAdminNodeDialog, { disableClose: true });
          }else{
            if(this.locations.length > 0){//there's more than one admin at this location; show _editUser form
              let dialogRef = this.dialog.open(this.nodeDialog, { disableClose: true });
            }
            else{//no locations exist on the site; show the no locations dialogue
              let dialogRef = this.dialog.open(this.noLocationsDialog, { disableClose: true });//this.noLocationsDialog
            }
            
          }
        }
      )
    }else{//this user is not an administrator
      if(this.locations.length > 0){//at least one location exists; show the _editUser form
        let dialogRef = this.dialog.open(this.nodeDialog, { disableClose: true });
      }
      else{//no locations exist on the site; show the no locations dialogue
        let dialogRef = this.dialog.open(this.noLocationsDialog, { disableClose: true });
      }
    }
  }

  
  deleteUser(user,action){
    this.user = user
    if (action == 'view'){ // do not allow an admin to be deleted
      if(this.user.user_role == 'administrator'){
        let dialogRef = this.dialog.open(this.adminDelNodeDialog, { disableClose: true });
      }
      else{ // this is a non-admin; delete ok
        let dialogRef = this.dialog.open(this.delNodeDialog, { disableClose: true });
      }
    }
    else if(action == 'delete'){
      this.soleMaintainerMsg = false
      this.checkSoleMaintainer(user)

      if(!this.soleMaintainerMsg){
        this.user_svc.deleteUser(user);

        // user has been deleted in ES; now remove this row from the table
        const userIndex = this.dataSource.data.indexOf(user);
        this.dataSource.data.splice(userIndex, 1);
        this.dataSource._updateChangeSubscription();
        this.dialog.closeAll();
        this.snackBar.open("Successfully deleted!", "Ok", {
          duration: 3000
        });
      }
    }
  }
  
  setAdminAt(){
    console.log("this.user.user_role: ", this.user.user_role)
  }

  getFormValidationErrors() {
    Object.keys(this._editUser.controls).forEach(key => {
      const controlErrors: ValidationErrors = this._editUser.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
         console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }

}