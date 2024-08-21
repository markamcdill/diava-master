import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClearanceDtgValidator } from 'src/app/shared/helpers/clearance-dtg.validator';
import { SSNValidator } from 'src/app/shared/helpers/ssn.validator';
import { ZuluValidator } from 'src/app/shared/helpers/zulu.validator';
import { VisitEditComponent } from './visit-edit.component';

// Create mock visit data to inject into constructor.
const visitData = {
  additional_visitors : ["", ""],
  visit_classification : "unclassified",
  visit_create_date : '01/01/2001',
  visit_modify_date : "01/01/2021"
}

describe('VisitEditComponent', () => {
  let component: VisitEditComponent;
  let fixture: ComponentFixture<VisitEditComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisitEditComponent ],
      imports: [ 
        MatDialogModule
       ],
      providers: [
        { provide: FormBuilder },
        { provide: MatSnackBar, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: visitData},
        { provide: MatDialogRef, useValue: {} },
        { provide: SSNValidator, useValue: {} },
        { provide: ClearanceDtgValidator, useValue: {} },
        { provide: ZuluValidator, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
