import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SubmitvisitComponent } from './submitvisit/submitvisit.component';
import { ManageComponent } from './manage/manage.component';
import { ManageReportsComponent } from './manage/manage-reports/manage-reports.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { ManageAdminsComponent } from './manage/manage-admins/manage-admins.component';
import { ManageUsersComponent } from './manage/manage-users/manage-users.component';
import { ManageLocationsComponent } from './manage/manage-locations/manage-locations.component';
import { SecurityConsentComponent } from './security-consent/security-consent.component';
import { ManageMsgWelcomeComponent } from './manage/manage-msg-welcome/manage-msg-welcome.component';
import { ManageMsgConfirmationComponent } from './manage/manage-msg-confirmation/manage-msg-confirmation.component';
import { MyvisitsComponent } from './myvisits/myvisits.component';
import { HelpAdministratorsComponent } from './help-administrators/help-administrators.component';
import { ManageSettingsComponent } from './manage/manage-settings/manage-settings.component';
import { ManageClearanceComponent } from './manage/manage-clearance/manage-clearance.component';
import { ManageAnalyticsComponent } from './manage/manage-analytics/manage-analytics.component';

const routes: Routes = [
  {path:'security_consent', component: SecurityConsentComponent },
  {path:'home', component: HomeComponent },
  {path:'submitvisit', component: SubmitvisitComponent },
  {path:'manage', component: ManageComponent },
  {path:'manage_reports', component: ManageReportsComponent },
  {path:'myaccount', component: MyaccountComponent },
  {path:'manage_admins', component: ManageAdminsComponent },
  {path:'manage_users', component: ManageUsersComponent },
  {path:'manage_locations', component: ManageLocationsComponent },
  {path:'manage_welcome', component: ManageMsgWelcomeComponent },
  {path:'manage_confirmation', component: ManageMsgConfirmationComponent },
  {path:'myvisits', component: MyvisitsComponent },
  {path:'help_administrators', component: HelpAdministratorsComponent },
  {path:'manage_settings', component: ManageSettingsComponent },
  {path:'manage_clearance', component: ManageClearanceComponent },
  {path:'manage_analytics', component: ManageAnalyticsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
