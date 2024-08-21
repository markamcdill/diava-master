import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SSNValidator } from 'src/app/shared/helpers/ssn.validator';

import { AdditionalVisitorComponent } from './additional-visitor.component';

describe('AdditionalVisitorComponent', () => {
  let component: AdditionalVisitorComponent;
  let fixture: ComponentFixture<AdditionalVisitorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports : [
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      declarations: [ AdditionalVisitorComponent ],
      providers : [
        { provide: FormBuilder },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: SSNValidator, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
