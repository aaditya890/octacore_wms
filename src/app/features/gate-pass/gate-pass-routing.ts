// src/app/features/gate-pass/gate-pass-routing.ts
import { Routes } from '@angular/router';
import { GatepassListComponent } from './components/gatepass-list/gatepass-list.component';
import { GatepassCreateComponent } from './components/gatepass-create/gatepass-create.component';

export const gatepassRoutes: Routes = [
  { path: '', component: GatepassListComponent },
  { path: 'create', component: GatepassCreateComponent }
];
