import { Component, OnInit, Inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdditionalVisitorServiceService } from 'src/app/submitvisit/additional-visitor/additional-visitor-service/additional-visitor-service.service';
import { PrivacyActComponent } from '../../../shared/privacy-act/privacy-act.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-visit-view',
  templateUrl: './visit-view.component.html',
  styleUrls: ['./visit-view.component.scss']
})
export class VisitViewComponent implements OnInit {

  classClass = 'unclass'
  visit_create_date_display;
  visit_modify_date_display

  constructor(@Inject(MAT_DIALOG_DATA) public visitData: any,  private dialog: MatDialog, private _visitorService?: AdditionalVisitorServiceService) {
    this._visitorService.setVisitorList(this.visitData['additional_visitors'])//populate the visitor service with any additional 
  }

  ngOnInit(): void {
    this.setVisitClassificationDisplay()
    if(!this.visitData['visit_modify_date'] || this.visitData['visit_modify_date'] == ""){//no modify date, set it to create date
      this.visitData['visit_modify_date'] = this.visitData['visit_create_date']
    }

    // set display values for create and modify dates
    this.visit_create_date_display = formatDate(this.visitData['visit_create_date'], 'MM/dd/YYYY', 'en-US')
    this.visit_modify_date_display = formatDate(this.visitData['visit_modify_date'], 'MM/dd/YYYY', 'en-US')
  }

   //Begin additional visitor code set
   get VisitorList(){
    return this._visitorService.getAllVisitors();
  }

  setVisitClassificationDisplay(){//user made a classification change -- set visit_classification_full to reflect (and display) the new value
    var dissem = "//NOFORN"
    if(!this.visitData['visit_classification_dissem']){//visit_classification_dissem == true/false (set the display value)
      dissem = ""
    }
    this.classClass = 'top-secret'//default to TOP SECRET (system high) css class selector
                                  //since the css selector has a dash in it and doesn't
                                  //precisely match the visitData['visit_classification'] value for top secret (no dash)
    if(this.visitData['visit_classification'].toLowerCase() != 'top secret')
    this.classClass = this.visitData['visit_classification'].toLowerCase()
    //display this value
    this.visitData['visit_classification_full'] = this.visitData['visit_classification'] + dissem
  }

    // Begin Privacy Act Statement Dialog
    openPAS() {
      const dialogRef = this.dialog.open(PrivacyActComponent);
    }
    // End Privacy Act Statement
}
