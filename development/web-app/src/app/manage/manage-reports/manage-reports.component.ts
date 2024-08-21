import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService, User } from "../../core/services/user.service";
import { FormBuilder, FormGroup, Validators,  } from '@angular/forms';
import { Visit, VisitService } from 'src/app/core/services/visit.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VisitViewComponent } from './visit-view/visit-view.component';
import { AdditionalVisitorServiceService } from 'src/app/submitvisit/additional-visitor/additional-visitor-service/additional-visitor-service.service';


@Component({
  selector: 'app-manage-reports',
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.scss']
})
export class ManageReportsComponent implements OnInit {
  dataSource:MatTableDataSource<Visit>
  @ViewChild(MatPaginator) paginator : MatPaginator;
  @ViewChild(MatSort) sort : MatSort;
  @ViewChild('viewNotificationDialog') viewNotificationDialog: TemplateRef<any>;
  @ViewChild('deleteConfirmationDialog') deleteConfirmationDialog: TemplateRef<any>;
  @ViewChild('purposeOfVisitDialog') purposeOfVisitDialog: TemplateRef<any>;

  

  user$:Observable<User>;
  user;
  visitResults = []
  searchForm : FormGroup;
  searchError = false
  noResults = false;
  noResultsStatement = ""
  searchStatement = ""
  dateRangeStatement = ""
  showHideResults = false

  visitData : any;
  editMode = false;
  editable = true;
  classClass = 'unclass'
  visit_create_date_display;
  visit_modify_date_display;
  today = new Date().getTime()
  visit_end_date_time;
  disableDeleteButton = true
  visitStatus;
  visitPurpose;



    displayedColumns: string[] = [
      "visit_classification",
      "location_name",
      "traveler_rank_grade",
      "traveler_full_name", 
      "visit_office_name",
      "visit_purpose",
      "visit_POC_full",
      "visit_start_dt_display",
      "visit_end_dt_display",
      "delete" ];

  


  constructor(userService : UserService, private router: Router, private formBuilder : FormBuilder, 
    private visitService : VisitService, private dialog : MatDialog, private snackBar : MatSnackBar, private _visitorService?: AdditionalVisitorServiceService) {

    this.user$ = userService.getUser(); //for access control
    
    // Search form group.
    this.searchForm = this.formBuilder.group({
      searchTerm: [null],
      arrivalDate: [null],
      departureDate: [null]
    });

  }

  ngOnInit() {
    document.getElementById("searchButton").focus()
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

  clearSearch(termType){
    this.noResults = false
    this.showHideResults = false
    this.visitResults = []
    if(termType == 'date'){
      this.searchForm.controls['arrivalDate'].setValue(null)
      this.searchForm.controls['departureDate'].setValue(null)
    }
    else if(termType == 'search'){
      this.searchForm.controls['searchTerm'].setValue(null)
    }
  }

  setSearchError(){ // set/show search error if no values passed
    document.getElementById("searchButton").focus()
    this.showHideResults = false
    this.visitResults = []
    
    this.noResults = false
    this.searchError = false
    //must pass either a search term or date range
    if(!this.searchForm.controls['searchTerm'].value && !this.searchForm.controls['arrivalDate'].value){// no search terms passed
      this.searchError = true
      return true
    }
    return false // at least one search term present
  }


  
  search() {

    if(!this.setSearchError()){//at least one search value is present; do the search
      var searchValue = this.searchForm.controls['searchTerm'].value
      var startDate = this.searchForm.controls['arrivalDate'].value
      var endDate = this.searchForm.controls['departureDate'].value

  
      //make the dates pretty
      if (startDate){
        startDate = formatDate(startDate, 'YYYY-MM-dd', 'en-US')
      }
      if (endDate){
        endDate = formatDate(endDate, 'YYYY-MM-dd', 'en-US')
      }
      //build the search JSON
      var search_data = {"searchValue": searchValue, "startDate": startDate, "endDate": endDate, "user_role": this.user.user_role, "location_id": this.user.location_id}

      this.visitService.searchVisits(search_data)//send it
      this.visitService._visits.subscribe(val =>{
        if(val){//wait for a value to return
          this.visitResults = val
          if(this.visitResults.length > 0){//set the dataSource
            this.dataSource = new MatTableDataSource(this.visitResults);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.noResults = false // make sure the no results statement is hidden
            this.showHideResults = true
            this.visitService._visits.next('')
          }
          else{// create the no results statement and display it
            this.searchStatement = ""
            this.dateRangeStatement = ""
            var joiner = ""
            if(searchValue){
              this.searchStatement = "'" + searchValue + "'"
              joiner = " within "
            }
            if(startDate){
              this.dateRangeStatement = joiner + "date-range '" + startDate + " - " + endDate + "'"
            }
            this.noResultsStatement = "No results found for " + this.searchStatement + this.dateRangeStatement
            this.noResults = true
          }
        }

      })
    }
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

  // Edit toggler for child visit-edit-view component.
  toggleEdit() {
    if (this.editMode == false) {
      this.editMode = true;
    }
    else {
      this.editMode = false;
    }
  }

  deleteVisit(event) {
    this.visitData = event;
    this.visit_end_date_time = new Date(this.visitData['visit_end_dt']).getTime()
    this.visitStatus = this.visitData.visit_status
    this.dialog.open(this.deleteConfirmationDialog, { autoFocus: false});
  }

  confirmDelete() {
    const index = this.visitResults.indexOf(this.visitData);
    if (index > -1) {
      this.visitResults.splice(index, 1);
    }
    this.dataSource.data = this.visitResults;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.visitService.deleteVisit(this.visitData)
    this.snackBar.open("Visit Deleted", "Ok", {
      duration: 3000,
      // panelClass: ['success-snackbar']
    });
  }

 
  viewNotification(visit){//open the edit dialog 
    const dialogRef = this.dialog.open(VisitViewComponent,{
      data: visit
      //width: '600px'
      //height: '100%'
    })
  }

  viewPuposeOfVisitDialog(visit){
    this.visitPurpose = visit.visit_purpose
    const dialogRef = this.dialog.open(this.purposeOfVisitDialog,{
      //width: '600px'
      //height: '100%'
    })
  }

  //Begin additional visitor code set
  get VisitorList(){
    return this._visitorService.getAllVisitors();
  }

  closeDialog(){
    this.editMode = false
  }

  setDisplayValues(){

       // configure the modify date
       if(!this.visitData['visit_modify_date'] || this.visitData['visit_modify_date'] == ""){//no modify date, set it to create date
        this.visitData['visit_modify_date'] = this.visitData['visit_create_date']
      }
        // set display values for create and modify dates
        this.visit_create_date_display = formatDate(this.visitData['visit_create_date'], 'MM/dd/YYYY', 'en-US')
        this.visit_modify_date_display = formatDate(this.visitData['visit_modify_date'], 'MM/dd/YYYY', 'en-US')
  }


  setClassClass(){
    this.classClass = 'top-secret'//default to TOP SECRET (system high); and because the class selector has a dash in it and doesn't precisely match the visitData['visit_classification']
    if(this.visitData['visit_classification'].toLowerCase() != 'top secret')
    this.classClass = this.visitData['visit_classification'].toLowerCase()
  }


  exportVisits() {
    const formData = new FormData();
    formData.append("visit_data", JSON.stringify(this.visitResults));

    this.visitService.exportVisits(formData).subscribe(
      res => {
    let blob = new Blob([res], { type: 'text/csv'})

    const a = document.createElement('a');
    a.setAttribute('type', 'hidden');  
    a.href = URL.createObjectURL(blob);  
    a.download = 'visits.csv';  
    a.click(); 
    a.remove();
      },
      err => {
        console.log(err);
      }
    );
  }

  // exportExcel(){
  //   // console.log("this.visitResults: ", this.visitResults)
  //   var eBlob = this.visitService.exportExcel(this.visitResults)
  //   console.log("eBlob: ", eBlob)
  // }
 
  printResults() {
    const searchResults = document.getElementById("searchResults");
    const printWindow = window.open('', '', 'left=0,top=0,width=1200,height=900,toolbar=0,scrollbars=0,status=0');
    printWindow.document.write(searchResults.innerHTML);
  }

  enableDelete(){
    if(this.disableDeleteButton){
      this.disableDeleteButton = false
    }
    else{
      this.disableDeleteButton = true
    }
  }

  resetDeleteDisable(){
    this.disableDeleteButton = true
  }

}





