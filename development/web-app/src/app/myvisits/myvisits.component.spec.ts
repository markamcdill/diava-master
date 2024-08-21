import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MyvisitsComponent } from './myvisits.component';

describe('MyvisitsComponent', () => {
  let component: MyvisitsComponent;
  let fixture: ComponentFixture<MyvisitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [
        MatSnackBarModule,
        HttpClientTestingModule,
        MatDialogModule
      ],
      declarations: [ MyvisitsComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {}},
        { provide: MatDialogRef, useValue: {} }
      ]})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyvisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
