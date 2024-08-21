import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClearanceDtgValidator } from '../shared/helpers/clearance-dtg.validator';
import { SSNValidator } from '../shared/helpers/ssn.validator';
import { ZuluValidator } from '../shared/helpers/zulu.validator';

import { SubmitvisitComponent } from './submitvisit.component';

describe('SubmitvisitComponent', () => {
  let component: SubmitvisitComponent;
  let fixture: ComponentFixture<SubmitvisitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports : [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatStepperModule,
        MatDialogModule,
        BrowserModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        MatCheckboxModule
      ],
      declarations: [ SubmitvisitComponent ],
      providers : [
        { provide: FormBuilder },
        { provide: MAT_DIALOG_DATA, useValue: {}},
        { provide: MatDialogRef, useValue: {} },
        { provide: SSNValidator, useValue: {} },
        { provide: ClearanceDtgValidator, useValue: {} },
        { provide: ZuluValidator, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitvisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should shorten welcome messages if greater than 80 characters', () => {
    let destination = {
      location_welcome_msg : "Duis volutpat tortor id interdum ornare. Cras commodo ultrices venenatis. Praesent interdum malesuada faucibus. Quisque aliquet placerat nulla eleifend ultricies."
    }

    component.destination = destination;
    component.mkShortMsg(destination.location_welcome_msg);
    fixture.detectChanges();
    expect(component.more).toBeTruthy();
  })
});
