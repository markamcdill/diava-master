import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { SubmitvisitComponent } from './submitvisit/submitvisit.component';
import { HeaderComponent } from './shared/header/header.component';

import { MaterialModule } from './shared/material/material.module';

import { AdditionalVisitorComponent } from './submitvisit/additional-visitor/additional-visitor.component';
import { AdditionalVisitorServiceService } from './submitvisit/additional-visitor/additional-visitor-service/additional-visitor-service.service';
import { ManageComponent } from './manage/manage.component';
import { ManageReportsComponent } from './manage/manage-reports/manage-reports.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { ManageAdminsComponent } from './manage/manage-admins/manage-admins.component';
import { ManageUsersComponent } from './manage/manage-users/manage-users.component';
import { ManageLocationsComponent } from './manage/manage-locations/manage-locations.component';
import { SecurityConsentComponent } from './security-consent/security-consent.component';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { PrivacyActComponent } from './shared/privacy-act/privacy-act.component';
import { ManageMsgWelcomeComponent } from './manage/manage-msg-welcome/manage-msg-welcome.component';
import { ManageMsgConfirmationComponent } from './manage/manage-msg-confirmation/manage-msg-confirmation.component';
import { MyvisitsComponent } from './myvisits/myvisits.component';
import { HelpAdministratorsComponent } from './help-administrators/help-administrators.component';
import { ManageSettingsComponent } from './manage/manage-settings/manage-settings.component';

import { ManageClearanceComponent } from './manage/manage-clearance/manage-clearance.component';

import { VisitEditComponent } from './myvisits/visit-edit/visit-edit.component';
import { VisitViewComponent } from './manage/manage-reports/visit-view/visit-view.component';
import { ClearanceDtgValidator } from './shared/helpers/clearance-dtg.validator';
import { LatLongValidator } from './shared/helpers/lat-long.validator';
import { NumberOnlyValidator } from './shared/helpers/number-only.validator';
import { SSNValidator } from './shared/helpers/ssn.validator';
import { ZuluValidator } from './shared/helpers/zulu.validator';
import { ManageAnalyticsComponent } from './manage/manage-analytics/manage-analytics.component';




@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SubmitvisitComponent,
    HeaderComponent,
    AdditionalVisitorComponent,
    ManageComponent,
    ManageReportsComponent,
    MyaccountComponent,
    ManageAdminsComponent,
    ManageUsersComponent,
    ManageLocationsComponent,
    SecurityConsentComponent,
    PrivacyActComponent,
    ManageMsgWelcomeComponent,
    ManageMsgConfirmationComponent,
    MyvisitsComponent,
    HelpAdministratorsComponent,
    ManageSettingsComponent,
    ManageClearanceComponent,
    VisitEditComponent,
    VisitViewComponent,
    ManageAnalyticsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    NgIdleKeepaliveModule.forRoot()
  ],
  providers: [AdditionalVisitorServiceService, ClearanceDtgValidator, LatLongValidator, NumberOnlyValidator, SSNValidator, ZuluValidator],
  entryComponents: [AdditionalVisitorComponent, PrivacyActComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
