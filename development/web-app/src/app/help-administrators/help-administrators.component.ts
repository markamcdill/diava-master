import { Component, OnInit } from '@angular/core';
import { LocationsService } from '../core/services/locations.service';
import { UserService } from '../core/services/user.service';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-help-administrators',
  templateUrl: './help-administrators.component.html',
  styleUrls: ['./help-administrators.component.scss']
})
export class HelpAdministratorsComponent implements OnInit {

  locations = [];
  admins = [];
  selectedLocation = "";
  selectedAdmins = [];

  displayedColumns: string[] = ['user_dn', 'user_email_jwics'];
  dataSource = new MatTableDataSource();

  constructor(private locationService : LocationsService, private userService : UserService) {

    this.locationService.getLocations();
    this.locationService._locations.subscribe((value) => {
      this.locations = value;  
    });

    this.userService.getAdmins();
    this.userService._admins.subscribe(value => {
      this.admins = value;
    })
   }

   showAdmins(location) {
     this.selectedLocation = location.value;   
     this.selectedAdmins = [];

     this.admins.forEach(admin => {
       if (admin.location_id == this.selectedLocation) {
         admin.user_dn = admin.user_dn.split(" ").slice(0, 2).join(" ");
         this.selectedAdmins.push(admin)
         this.dataSource.data = this.selectedAdmins;
       }
     })
   }

  ngOnInit(): void {
  }

}
