import { OnInit, Component, ViewChild, TemplateRef} from '@angular/core';
import { Observable } from 'rxjs';
import { UserService, User } from "../../core/services/user.service";
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitService } from 'src/app/core/services/visit.service';
import { formatDate } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClearanceDtgValidator } from 'src/app/shared/helpers/clearance-dtg.validator';

@Component({
  selector: 'app-manage-clearance',
  templateUrl: './manage-clearance.component.html',
  styleUrls: ['./manage-clearance.component.scss']
})
export class ManageClearanceComponent implements OnInit {
  

  user$:Observable<User>;
  user;
  searchTerm = '';
  searchForm : FormGroup;
  clearanceForm: FormGroup;

  

  // Displayed column names must match matColumnDef in order for sorting to work correctly.
  // <ng-container matColumnDef="visit_classification">
  displayedColumns: string[] = ['visit_classification', 'traveler_lname', 'visit_start_dt_display', 'visit_end_dt_display', 'update'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('updateClearanceDialog') updateClearanceDialog: TemplateRef<any>;
  visitResults: any[];
  noResults: boolean;
  showResults: boolean;
  selectedResult: any;

  constructor(userService : UserService, 
    private router: Router, 
    private dialog: MatDialog,
    private fb: FormBuilder,
    private visitService : VisitService,
    private snackBar : MatSnackBar,
    private clearanceDtgValidator: ClearanceDtgValidator
    ){

    this.user$ = userService.getUser(); //for access control

      this.searchForm = fb.group({
        'searchTerm' : [null, Validators.required]
      });
      this.clearanceForm = fb.group({
        'visit_clearance_msg_dtg':[null, [Validators.required, Validators.pattern(clearanceDtgValidator.clearanceDTG)]],
        'clearance_recieved':[null, Validators.required],   
        'clearance_country_recieved':[null, Validators.required], 
      });
  }

  ngOnInit(): void {
     // get the current user
     this.user = this.user$.subscribe(
      val =>{
        this.user = val;
        //Validates access controls -- only maintainers and administators have access to this page
        if(this.user.user_role == "read-only"){
          this.router.navigate(['./home']);
        }
      }
    )
  }

  abbreviate(classification) {
    const classifiers = [["UNCLASSIFIED", "U"], ["CONFIDENTIAL", "C"], ["SECRET", "S"], ["TOP SECRET", "TS"]]
    const coreClass = classification.split("//")
    var thisClass = ""
    
    classifiers.forEach(clsSet =>{
    if(clsSet[0] == coreClass[0]){
    thisClass = clsSet[1]
    }
    })
    
    if(classification.indexOf("//") > 0){
    thisClass += "//NF"
    }
    
    return thisClass;
    }

  search() {

    if (this.searchTerm != "") {
      this.visitResults = [];
      // Search by traveler name or notification ID
      // with today's date and beyond.
      let searchData = { 
        "searchValue" : this.searchTerm, 
        "user_role" : this.user.user_role,
        "location_id" : this.user.location_id,
        "startDate" : null,
        "endDate" : null
      }
  
      this.visitService.searchVisits(searchData);
      this.visitService._visits.subscribe(value => {
        if (value) {
            // Only show visits in which its end date is equal to or greater than 
            // today's date.
            let startDate = formatDate(new Date(), 'YYYY-MM-dd', 'en-US');
            let visits = [];
            Object.keys(value).forEach(function (key) {
              let endDate = formatDate(value[key].visit_end_dt, 'YYYY-MM-dd', 'en-US');
              if (endDate >= startDate) {
                visits.push(value[key]);
              }
            })
            
            if (visits.length == 0) {
              this.noResults = true;
              this.showResults = false;
            }
            else {
              this.visitResults = visits;
              this.dataSource = new MatTableDataSource(this.visitResults);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.showResults = true;
              this.noResults = false;
              this.visitService._visits.next('') 
            }      
        }
      })
    }
  }

  clearanceDialog(clearanceData){

    if(clearanceData != undefined) {
      this.selectedResult = clearanceData;

      // Append the new status fields.
      if (this.selectedResult["traveler_clearance_recieved"] == null) {
        this.selectedResult["traveler_clearance_recieved"] = "";
      }

      if (this.selectedResult["traveler_country_recieved"] == null) {
        this.selectedResult["traveler_country_recieved"] = "";
      }

      this.dialog.open(this.updateClearanceDialog, { disableClose: true });
    }
  }

  validForm() {
    let validForm = false;
    let errors = []

    // Check if the form has errors before updating.
    Object.keys(this.clearanceForm.controls).forEach(key => {
      if (this.clearanceForm.get(key).errors != null) {
        errors.push(this.clearanceForm.get(key).errors)
      }
    })

    if (errors.length == 0) {
      validForm = true;
    }
    return validForm;
  }

  saveClearance() {
    if (this.validForm()) {
      this.visitService.updateVisit(this.selectedResult);
      this.dialog.closeAll();
      this.snackBar.open("Successfully saved!", "Ok", {
      duration: 3000,
    });
    }
    
  }

}


