import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { ManageUsersComponent } from './manage-users.component';

describe('ManageUsersComponent', () => {
  let component: ManageUsersComponent;
  let fixture: ComponentFixture<ManageUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule
      ],
      declarations: [ ManageUsersComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should verify a location if the user is an admin and if the location is active', () => {
    let user = {
      user_role : "administrator"
    }

    let location = {
      location_active: "yes"
    }

    component.setLocationValidation(user, location);
    fixture.detectChanges();
    expect(location["location_valid"]).toBe("yes");
  })

  it('should toggle user admin status if adminAt attribute is present', () => {
    let user = {
      adminAt : "location",
      user_role : ""
    }
    component.editUser = user;
    component.setAdminAtProfile();
    fixture.detectChanges();
    expect(component.editUser.user_role).toBe("administrator");
  })

  it('should present form with read-only display', () => {
    let user = {
      adminAt : "location",
      user_role : "administrator"
    }
    component.editUser = user;
    let event =  { data : "user"};
    component.configForm(event);
    fixture.detectChanges();

    // Admin checkbox should not display.
    expect(component.showAdminAt).toBeFalsy();
    // JWICS email field should not display.
    expect(component.showUserEmailJwics).toBeFalsy();
    // Uncheck admin checkbox
    expect(component.adminAt).toBeFalsy();
  })

  it('should assume the current user is not the sole maintainer', () => {
    component.checkSoleMaintainer(null);
    fixture.detectChanges();
    expect(component.soleMaintainer).toBeFalsy();
    expect(component.soleMaintainerMsg).toBeFalsy();
  })

});

