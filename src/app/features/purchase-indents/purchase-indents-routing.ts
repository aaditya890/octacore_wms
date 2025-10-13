// src/app/features/purchase-indents/purchase-indents-routing.ts
import { Routes } from '@angular/router';
import { IndentListComponent } from './components/indent-list/indent-list.component';
import { IndentCreateComponent } from './components/indent-create/indent-create.component';

export const purchaseIndentRoutes: Routes = [
  { path: '', component: IndentListComponent },
  { path: 'create', component: IndentCreateComponent }
];
