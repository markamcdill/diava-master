import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { ManageMsgConfirmationComponent } from './manage-msg-confirmation.component';

describe('ManageMsgConfirmationComponent', () => {
  let component: ManageMsgConfirmationComponent;
  let fixture: ComponentFixture<ManageMsgConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
         HttpClientTestingModule,
         FormsModule, 
         ReactiveFormsModule,
         RouterTestingModule,
         MatSnackBarModule
        ],
      declarations: [ ManageMsgConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMsgConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not allow special characters in confirmation message', () => {
    let msg = component.confMsgForm.controls['confirmation_message'];
    // Set the confirmation message form control to forbidden special characters.
    msg.setValue('{<[/+_');
    fixture.detectChanges();

    // Test the submit() action.
    component.submit();
    fixture.detectChanges();

    // invalidForm should be defined now and set to error message.
    expect(component.invalidForm).toBeDefined();
  });
});

