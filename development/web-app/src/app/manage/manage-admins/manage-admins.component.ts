import { AfterViewInit, Component, ViewChild, TemplateRef } from '@angular/core';
import { UserService, User} from "../../core/services/user.service";
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LocationsService } from "../../core/services/locations.service";


@Component({
  selector: 'app-manage-admins',
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.scss']
})
export class ManageAdminsComponent implements AfterViewInit {
  @ViewChild('nodeDialog') nodeDialog: TemplateRef<any>;
  @ViewChild('mkAdminDialog') mkAdminDialog: TemplateRef<any>
  @ViewChild('rmAdminDialog') rmAdminDialog: TemplateRef<any>
  @ViewChild('notReadOnlyDialogue') notReadOnlyDialogue: TemplateRef<any>

  // Admins should only be allowed to assign a read-only user as an admin for their location.
  // only the user can demote from admin to read-only
  //    -- unless they are the only admin at a location
  // candidate admin can belong to any location prior to acquiring admin role at another location
  // admins automatically assume the location where they are made admin
  // maintainer can promote/demote as needed

  curUser$:Observable<User>;
  curUser;
  admin$;
  admin = null;
  admins=[];
  users=[];
  locations=[];
  location;
  displayedColumns: string[] = ['user_cn', 'location_name', 'user_role', 'remove_user'];
  addAdminDisplayedColumns: string[] = ['user_cn']
  shwSrchRes = false
  candidateAdmin;
  nameParts; //defines user name first name, late name, mi and d number
  soleAdmin$:Observable<User>
  soleAdmin = false;
  dataSource: MatTableDataSource<User>;
  srchDataSource: MatTableDataSource<User>;
  adminSelfRemoval = false; //boolean indicating an admin is removing themselves as an admin

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public _mkAdmin: FormGroup;
    user_cn: any;
    user_role: any;
    location_id: any;
    user_email_jwics: any;

  constructor(private user_svc:UserService, private svcLocation:LocationsService, private dialog: MatDialog, private _formBuilder: FormBuilder, private router: Router) {
    this.admin$ = user_svc.getAdmins();
    this.curUser$ = user_svc.getUser();

    this.svcLocation.getLocations();
    this.svcLocation._locations.subscribe((value) => {
      this.locations = value;  
    });
    
    this.user_svc.getAdmins()
    this.user_svc._admins.subscribe((value) => {
      this.admins = value;
      if(this.admins){
        this.dataSource = new MatTableDataSource(this.admins); 
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
    
    this.user_svc.getUsers("")
    this.user_svc._users.subscribe((value) => {
      this.users = value
      if(this.users){
        this.srchDataSource = new MatTableDataSource(this.users)
        this.srchDataSource.sort = this.sort;
      }
    })


 
  }

  ngOnInit(): void {
    this._mkAdmin = this._formBuilder.group({
      user_cn: [null],
      user_role: [null],
      location_id: [null, Validators.required],
      user_email_jwics: [null,([Validators.required,Validators.email])]
    });


    // get the current user
    this.curUser = this.curUser$.subscribe(
      val =>{
        this.curUser = val;
        //Validates access controls so only maintainers and adminstrators have access to this page
        if(this.curUser.user_role == "read-only"){
          this.router.navigate(['./home']);
        }
      }
    )

  }


  ngAfterViewInit() {}

  cancel() {
    this._mkAdmin.reset();
    this.shwSrchRes = false
    this.dialog.closeAll();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if(filterValue.length >= 1){
      this.user_svc.getUsers(filterValue.trim().toLowerCase());
      this.shwSrchRes = true
    }
    else{
      this.shwSrchRes = false
    }
  
  }

  addAdmin() {// open the search dialogue
    let dialogRef = this.dialog.open(this.nodeDialog, { disableClose: true });
    this._mkAdmin.reset()
  }

 

  mkAdmin(user){// close search dialogue, open the make admin dialogue, set candidate admin
    this.candidateAdmin = user;

    if(this.candidateAdmin.user_role != 'read-only'){
      let dialogRef = this.dialog.open(this.notReadOnlyDialogue, {disableClose: true})
    }
    else{
      this.nameParts = this.user_svc.getNameParts(user.user_cn)
      // this._mkAdmin.reset()
      if (user.user_role == 'administrator'){
        this.soleAdmin$ = this.user_svc.chkSoleAdmin(user)
        this.soleAdmin$.subscribe(
          val => {
            this.soleAdmin = val['soleAdmin']
          }
        )
      }
      
      this.dialog.closeAll()// close the search dialogue and switch to the admin dialogue
      let dialogRef = this.dialog.open(this.mkAdminDialog, { disableClose: true })
    }

    
    

  }
  
  setAdmin(){// update this user's role to administrator, set their location information

    if(this._mkAdmin.valid){
      this.candidateAdmin.user_role = 'administrator'
      this.candidateAdmin.user_email_jwics = this._mkAdmin.controls['user_email_jwics'].value
  
      // if current user is an admin, set the candidate admin's location to the current user's location
      if (this.curUser.user_role == 'administrator'){
        this.candidateAdmin.location_id = this.curUser.location_id
      }
      // get the location name (by location_id)
      this.candidateAdmin.location_name = this.getLocationName(this.candidateAdmin.location_id)

      this.locations.forEach(location=>{ // set the location name associated with this location_id
        if(location.location_id == this.candidateAdmin.location_id){
          this.candidateAdmin.location_name = location.location_name;
          this.setLocationValidation(this.candidateAdmin, location)
        }
      })

  
      this.user_svc.editUser(this.candidateAdmin)
      this.dialog.closeAll()
      if(!this.chkList()){
        this.dataSource.data.push(this.candidateAdmin)
        this.dataSource._updateChangeSubscription()
      }
    }

    this.shwSrchRes = false
  }



  // set this location's validation status
  // valid location == 'active' with an administrator
  setLocationValidation(user,location){
    location['location_valid'] = 'no'//location not valid until re-validated
    if(user.user_role == 'administrator' && location.location_active == 'yes'){//location is active and this user assigned as administrator 
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

  removeAdmin(admin, action){
    this.admin = admin
    
    this.nameParts = this.user_svc.getNameParts(this.admin.user_cn)
    if (this.admin.user_role == 'administrator'){
      this.soleAdmin$ = this.user_svc.chkSoleAdmin(this.admin)
      this.soleAdmin$.subscribe(
        val => {
          this.soleAdmin = val['soleAdmin']
        }
      )
    }
    if(action=='view'){
      this.adminSelfRemoval = false; 
      if(this.admin.user_cn == this.curUser.user_cn){//admin removing themselves; set a flag and give them a warning
        this.adminSelfRemoval = true
      }
      let dialogRef = this.dialog.open(this.rmAdminDialog, { disableClose: true })
    }
    else if(action=='remove'){
      this.admin.user_role = 'read-only'
      this.admin.location_id = ''
      this.admin.location_name = ''

      this.user_svc.editUser(this.admin)

      const userIndex = this.dataSource.data.indexOf(this.admin);
      this.dataSource.data.splice(userIndex, 1);
      this.dataSource._updateChangeSubscription()
      this.dialog.closeAll()
      if(this.adminSelfRemoval){
        location.reload();
      }
    }
    this._mkAdmin.reset()
  }

  getLocationName(location_id){
      for(let location of this.locations){
        if(location_id == location.location_id){
          return location.location_name
        }
      }
  }

  chkList(){
    for(let row of this.dataSource.data){
      if(this.candidateAdmin.user_cn == row.user_cn){
        return true
      }
    }
    return false
  }

}

