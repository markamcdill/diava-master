import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { VisitViewComponent } from './visit-view.component';

describe('VisitViewComponent', () => {

  let component: VisitViewComponent;
  let fixture: ComponentFixture<VisitViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisitViewComponent ],
      imports: [ MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
    ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitViewComponent);
    component = fixture.componentInstance;
    // Setup visit values to properly initialize.
    spyOn(component, "setVisitClassificationDisplay").and.returnValue(null);
    spyOn(component, "ngOnInit").and.returnValue(null);
    component.visitData['visit_create_date'] = '01/01/2001'
    component.visitData['visit_modify_date'] = "01/02/2002"
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
