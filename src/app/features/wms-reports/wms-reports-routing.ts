// src/app/features/wms-reports/wms-reports-routing.ts
import { Routes } from '@angular/router';
import { ReportListComponent } from './components/report-list/report-list.component';
import { ReportDetailComponent } from './components/report-detail/report-detail.component';

export const reportRoutes: Routes = [
  { path: '', component: ReportListComponent },
  { path: ':id', component: ReportDetailComponent }
];
