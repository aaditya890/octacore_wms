import { Routes } from '@angular/router';
import { AppRoutes } from './core/models/app.routes.constant';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';


export const routes: Routes = [
  { path: '', redirectTo: AppRoutes.DASHBOARD, pathMatch: 'full' },

  {
    path: AppRoutes.AUTH,
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/wms-auth/wms-auth-routing').then(m => m.authRoutes),
  },

  // 🧭 MAIN APP PAGES (with sidebar + header)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: AppRoutes.DASHBOARD,
        loadChildren: () =>
          import('./features/dashboard/dashboard-routing').then(m => m.dashboardRoutes),
      },
      {
        path: AppRoutes.INVENTORY,
        loadChildren: () =>
          import('./features/inventory/inventory-routing').then(m => m.inventoryRoutes),
      },
      {
        path: AppRoutes.PURCHASE_INDENTS,
        loadChildren: () =>
          import('./features/purchase-indents/purchase-indents-routing').then(m => m.purchaseIndentRoutes),
      },
      {
        path: AppRoutes.GATE_PASS,
        loadChildren: () =>
          import('./features/gate-pass/gate-pass-routing').then(m => m.gatepassRoutes),
      },
      {
        path: AppRoutes.INOUT,
        loadChildren: () =>
          import('./features/inwards-outwards/inwards-outwards-routing').then(m => m.inoutRoutes),
      },
      {
        path: AppRoutes.USER_MANAGEMENT,
        loadChildren: () =>
          import('./features/user-management/user-management-routing').then(m => m.userManagementRoutes),
      },
      {
        path: AppRoutes.REPORTS,
        loadChildren: () =>
          import('./features/wms-reports/wms-reports-routing').then(m => m.reportRoutes),
      },
      {
        path: AppRoutes.SETTINGS,
        loadChildren: () =>
          import('./features/wms-settings/wms-settings-routing').then(m => m.settingsRoutes),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
      },
    ],
  },

  { path: '**', redirectTo: AppRoutes.DASHBOARD },
];
