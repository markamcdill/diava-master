import { DatePipe } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { User, UserService } from '../core/services/user.service';
import { VisitService } from '../core/services/visit.service';
import { VisitEditComponent } from './visit-edit/visit-edit.component';
import { SettingsService, Settings } from '../core/services/settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-myvisits',
  templateUrl: './myvisits.component.html',
  styleUrls: ['./myvisits.component.scss']
})

export class MyvisitsComponent{

  displayedColumns: string[] = [
    'visit_classification_full',
    'location_name',
    'visit_start_dt_display',
    'visit_end_dt_display',
    'edit',
    'cancel'
  ];
  

  @ViewChild(MatSort) sort : MatSort;
  @ViewChild(MatPaginator) paginator : MatPaginator;
  
  // @ViewChild('editNotificationDialog') editNotificationDialog: TemplateRef<any>;
  @ViewChild('cancelConfirmationDialog') cancelConfirmationDialog: TemplateRef<any>;

  visits = [];
  user$ : Observable<User>;
  user;
  settings$:Observable<Settings>
  settings;

  dataSource = new MatTableDataSource();
  visitData : any;
  visitsClass = "hideVisits"
  noVisitsClass = "hideNoVisits"
  

  constructor(private snackBar : MatSnackBar, private visitService : VisitService, private userService : UserService, private dialog : MatDialog, private settingsService: SettingsService) {
    this.user$ = this.userService.getUser();

    
    this.visitService.getVisitsByUser().subscribe(visit => {
      Object.keys(visit).forEach(key => {
        visit[key].forEach(visit => {
          //console.log("visit: ", visit)
          this.visits.push(visit)
        })
      })
      if(this.visits.length > 0){
        this.visitsClass = "showVisits"
      }
      else{
        this.noVisitsClass = "showNoVisits"
      }

      this.dataSource.data = this.visits;
      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator;
    })


    this.settings$ = this.settingsService.getSettings();
    this.settings = this.settings$.subscribe(val =>{
      this.settings = val[0]
    })
  }

 

  cancelVisit(event) {
    this.visitData = event;
    this.dialog.open(this.cancelConfirmationDialog, { 
      autoFocus: false,
      disableClose: true
     });
  }

  confirmCancel() {
    this.visitData["visit_status"] = "CANCELLED";
    this.visitData.visit_start_dt = new Date(this.visitData.visit_start_dt).toISOString();
    this.visitData.visit_end_dt = new Date(this.visitData.visit_end_dt).toISOString();
    this.visitData.traveler_dob = new Date(this.visitData.traveler_dob).toISOString();
    this.visitService.updateVisit(this.visitData);
    const index = this.visits.indexOf(this.visitData);
    if (index > -1) {
      this.visits.splice(index, 1);
    }
    this.dataSource.data = this.visits;
    this.dataSource.paginator = this.paginator;
    this.visitData['settings'] = this.settings
    this.visitService.sendEmail(this.visitData)
    if(this.visits.length == 0){
      this.visitsClass = "hideVisits"
      this.noVisitsClass = "showNoVisits"
    }
    this.snackBar.open("Visit successfully cancelled and email confirmations sent!", "Ok", {
      duration: 3000,
    });
  }

  editVisitNotification(visit){//open the edit dialog 
    var editedVisit;
    const dialogRef = this.dialog.open(VisitEditComponent,{
      data: visit,
      disableClose: true
      // width: '80% ',
      // height: '100%'
    })
    dialogRef.afterClosed().subscribe(result =>{

      if(result.action == 'submit'){//set status and start/end date formats; update the visit and send email
        editedVisit = result.data
        //console.log("editedVisit: ", editedVisit)
        const dateFormat = 'MMM dd YYYY'
        //set status
        editedVisit['visit_status'] = "UPDATED"
        //set modified date 
        editedVisit['visit_modify_date'] = new Date()
        //set display dates
        editedVisit['visit_start_dt_display'] = this.getFormattedDate(new Date(editedVisit['visit_start_dt']), dateFormat)
        editedVisit['visit_end_dt_display'] = this.getFormattedDate(new Date(editedVisit['visit_end_dt']), dateFormat)
        //update the visit and send email
        this.visitService.updateVisit(editedVisit);
        editedVisit['settings'] = this.settings
        this.visitService.sendEmail(editedVisit)
      }
      else if(result.action == 'close'){//close and restore original data
        //NOTE: must find row index by visit_id (since the data has been modified)

        var rowIdx;//index of the row in this.visits

        this.visits.forEach(function(row,idx) {//find/capture modified row's index from this.visits
          if(row['visit_id'] == result.data['visit_id']){//result.data == the original data -- find it by visit_id in visits
            rowIdx = idx
          }
        })
        // console.log("result: ", result)
        this.visits[rowIdx] = result.data//reset visit's row to original data (by index)
        this.dataSource.data = this.visits//reset the dataSource
      }

    })
  }

  // transform a valid date object (date) into the requested format (format)
  // prepend the text value for the day of week onto the formated date
  getFormattedDate(date: Date, format: string) {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const datePipe = new DatePipe('en-US');
    return weekDays[date.getDay()] + " " + datePipe.transform(date, format);
  }

}
