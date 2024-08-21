import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { LocationsService, Location } from "../../core/services/locations.service";
import { UserService, User } from 'src/app/core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ChkLatLong } from 'src/app/shared/helpers/chk-lat-long';
import { ChkLocationName } from 'src/app/shared/helpers/chk-location-name';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LatLongValidator } from 'src/app/shared/helpers/lat-long.validator';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-manage-locations',
  templateUrl: './manage-locations.component.html',
  styleUrls: ['./manage-locations.component.scss']
})


export class ManageLocationsComponent implements OnInit {
  @ViewChild('nodeDialog') nodeDialog: TemplateRef<any>;
  @ViewChild(MatSort) matSort : MatSort;

  public _addLocation: FormGroup;
  
  curUser$:Observable<User>;
  curUser;
  location = null;
  location_tmp = {
    "location_name": "",
    "location_lat": "",
    "location_long": "",
    "location_active": ""
  }
  locations=[];
  admins$;
  admins=[];
  displayedColumns: string[] = [ //Column names for data table
    'location_name', 
    'location_lat',
    'location_long', 
    'location_active',
    'edit']; 

  dataSource: MatTableDataSource<Location>; // Source for data table 

  location_name: any;
  location_lat: any;
  location_long: any;
  location_active: any;
  location_id: any;

  constructor(
    private snackBar : MatSnackBar,
    private svc:LocationsService, 
    private usr_svc:UserService, 
    private dialog: MatDialog, 
    private _formBuilder: FormBuilder, 
    private router: Router, 
    private latLongValidator: LatLongValidator) 
    { 
    this.curUser$ = usr_svc.getUser();
    this.svc.getLocations();
    
    this.svc._locations.subscribe((value) => {
      this.locations = value;  
    }); 

    this.svc._locations.subscribe((value) => {
      this.locations = value;  
      if(this.locations){
        this.dataSource = new MatTableDataSource(this.locations);
        this.dataSource.sort = this.matSort;
      }      
    }); 

    this.usr_svc.getAdmins()
    this.usr_svc._admins.subscribe(val =>{
      this.admins = val
    });
  }
  
  ngOnInit(): void {
    this._addLocation = this._formBuilder.group({
      location_id: [this.location_id],
      location_name: [this.location_name],
      location_active: [this.location_active, Validators.required],
      location_lat: [null],
      location_long: [null]
    }, {
      validators: [ChkLatLong('location_lat', 'location_long', this.latLongValidator), ChkLocationName('location_id', 'location_name', this.locations)]
    });

    // get the current user
    this.curUser = this.curUser$.subscribe(
      val =>{
        this.curUser = val;
        //Validates access controls -- only maintainers have access to this page
        if(this.curUser.user_role == "read-only" || this.curUser.user_role == "administrator"){
          this.router.navigate(['./home']);
        }
      }
    )
  }


  onSubmit(){
    
    let validForm = true;


    Object.keys(this._addLocation.controls).forEach(key => {
      if (this._addLocation.get(key).errors != null) {
        validForm = false;
      }
    })

    if(this.location.location_id == "" && validForm){//this is a new location (no location_id)
      this.location.location_name = this.location_tmp.location_name
      this.location.location_lat = this.location_tmp.location_lat
      this.location.location_long = this.location_tmp.location_long
      this.location.location_active = this.location_tmp.location_active
      this.svc.createLocation(this.location);
      this.dataSource._updateChangeSubscription();
      this.dataSource.data.push(this.location);
      this.snackBar.open("Successfully added!", "Ok", {
        duration: 3000
      });
      
    }
    else if(validForm) {//this is an existing location (for edit)
      this.location.location_name = this.location_tmp.location_name
      this.location.location_lat = this.location_tmp.location_lat
      this.location.location_long = this.location_tmp.location_long
      this.location.location_active = this.location_tmp.location_active
      this.snackBar.open("Successfully updated!", "Ok", {
        duration: 3000
      });

      // set location valid status 
      // valid location == 'active' status with an administrator assigned
      this.location['location_valid'] = 'no'// all locations are invalid until re-validated 
      if(this.location.location_active == 'yes'){//location is acive; if admin assigned it's a valid location
        this.admins.forEach(admin => {
          if(admin.location_id == this.location.location_id){
            this.location['location_valid'] = 'yes'
          }
        });
      }
      this.svc.editLocation(this.location);
    }
  
    if (validForm) {  

      setTimeout(() => {
        this.svc.getLocations();
      }, 1000)  

      this._addLocation.reset();
      this.dialog.closeAll();
    

    }
  }

  openNodeDialog(){
    let dialogRef = this.dialog.open(this.nodeDialog, { disableClose: true });
  }

  addLocation(){
    this.location = {
      location_name: '',
      location_active: '',
      location_lat: '',
      location_long: '',
      location_id: ''
    } // Resets the values in the dialog form 
    let dialogRef = this.dialog.open(this.nodeDialog, { disableClose: true });
  }

  editLocation (location){

    this.location = location
    this._addLocation.controls['location_id'].setValue(this.location.location_id)
    this.location_id = this.location.location_id
    this.location_tmp.location_name = location.location_name
    this.location_tmp.location_lat = location.location_lat
    this.location_tmp.location_long = location.location_long
    this.location_tmp.location_active = location.location_active
    let dialogRef = this.dialog.open(this.nodeDialog, { disableClose: true });
  }

  cancel(){
    this._addLocation.reset()
  }
}
