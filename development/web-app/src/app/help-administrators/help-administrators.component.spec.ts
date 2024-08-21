import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { HelpAdministratorsComponent } from './help-administrators.component';
import {MatTableHarness} from "@angular/material/table/testing";
import { HarnessLoader } from '@angular/cdk/testing';
import { MaterialModule } from '../shared/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";

describe('HelpAdministratorsComponent', () => {
  let component: HelpAdministratorsComponent;
  let fixture: ComponentFixture<HelpAdministratorsComponent>;
  let tableHarness : HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        HttpClientTestingModule,
        MatTableModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [ HelpAdministratorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpAdministratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tableHarness = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show admins assigned to each location', async () => {

    component.admins = [] as any[];

    // Create a test location.
    let location = {
      "value" : "loc1"
    }
    // Create a test admin.
    component.admins.push( { "location_id" : "loc1", "user_dn" : " some_user "});

    // Test function to find admins with matching locations.
    component.showAdmins(location);
    fixture.detectChanges();

    // Datasource should be populated and dropdown shown.
    expect(component.dataSource.data.length).toBeGreaterThan(0);

    fixture.detectChanges();

    // Optional test case to verify MatTable headers.
    // let harness = await tableHarness.getHarness(MatTableHarness);
    // let rows = await harness.getRows();
    // expect(rows.length).toBeGreaterThan(0);

  })
});


