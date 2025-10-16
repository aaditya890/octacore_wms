// src/app/features/purchase-indents/purchase-indents-routing.ts
import { Routes } from '@angular/router';
import { IndentListComponent } from './components/indent-list/indent-list.component';
import { IndentCreateComponent } from './components/indent-create/indent-create.component';

export const purchaseIndentRoutes: Routes = [
 { path: '', redirectTo: 'list', pathMatch: 'full' },
{ path: 'list', loadComponent: () => import('./components/indent-list/indent-list.component').then(m => m.IndentListComponent) },
{ path: 'create', loadComponent: () => import('./components/indent-create/indent-create.component').then(m => m.IndentCreateComponent) },

];
