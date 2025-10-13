// src/app/features/wms-settings/wms-settings-routing.ts
import { Routes } from '@angular/router';
import { CompanySettingsComponent } from './components/company-settings/company-settings.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';

export const settingsRoutes: Routes = [
  { path: 'company', component: CompanySettingsComponent },
  { path: 'profile', component: ProfileSettingsComponent }
];
