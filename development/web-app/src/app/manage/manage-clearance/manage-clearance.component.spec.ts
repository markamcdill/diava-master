import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { VisitService } from 'src/app/core/services/visit.service';
import { ClearanceDtgValidator } from 'src/app/shared/helpers/clearance-dtg.validator';

import { ManageClearanceComponent } from './manage-clearance.component';

describe('ManageClearanceComponent', () => {
  let component: ManageClearanceComponent;
  let fixture: ComponentFixture<ManageClearanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule, 
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatDialogModule
       ],
      declarations: [ ManageClearanceComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: ClearanceDtgValidator, useValue: {} }
    ]
    })
    .compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(ManageClearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not allow clearance to be updated without traveler clearance MSG DTG', () => {
    let msg = component.clearanceForm.controls['visit_clearance_msg_dtg'];
    msg.setValue('')
    expect(msg.valid).toBeFalsy();
  })

  it('should not allow clearance to be updated without specifying whether clearance has been recieved', () => {
    let msg = component.clearanceForm.controls['clearance_recieved'];
    msg.setValue('')
    expect(msg.valid).toBeFalsy();
  })

});
