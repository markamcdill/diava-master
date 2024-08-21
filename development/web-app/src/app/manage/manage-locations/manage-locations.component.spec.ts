import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { LatLongValidator } from 'src/app/shared/helpers/lat-long.validator';

import { ManageLocationsComponent } from './manage-locations.component';

describe('ManageLocationsComponent', () => {
  let component: ManageLocationsComponent;
  let fixture: ComponentFixture<ManageLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [
        MatSnackBarModule,
        HttpClientTestingModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      declarations: [ ManageLocationsComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: LatLongValidator, useValue: {}}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not allow a new location to be added without a location name', ()=> {
    let location = component._addLocation.controls['location_name'];
    location.setValue('')
    expect(location.valid).toBeFalsy();
  })

  it('should not allow a new location to be added without specifying whether location is active or disabled', ()=> {
    let location = component._addLocation.controls['location_active'];
    location.setValue('')
    expect(location.valid).toBeFalsy();
  })

});
