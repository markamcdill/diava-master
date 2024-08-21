import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ManageMsgWelcomeComponent } from './manage-msg-welcome.component';

describe('ManageMsgWelcomeComponent', () => {
  let component: ManageMsgWelcomeComponent;
  let fixture: ComponentFixture<ManageMsgWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule, 
        ReactiveFormsModule, 
        RouterTestingModule,
        MatSnackBarModule
      ],
      declarations: [ ManageMsgWelcomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMsgWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not allow special characters in welcome message', () => {
    let msg = component.welcomeMsgForm.controls['welcome_message'];
    // Set the welcome message form control to forbidden special characters.
    msg.setValue('{<[/+_');
    fixture.detectChanges();

    // Test the submit() action.
    component.submit();
    fixture.detectChanges();

     // invalidForm should be defined now and set to error message.
    expect(component.invalidForm).toBeDefined();
  });
});
