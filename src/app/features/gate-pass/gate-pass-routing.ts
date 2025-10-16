// src/app/features/gate-pass/gate-pass-routing.ts
import { Routes } from '@angular/router';
import { GatepassListComponent } from './components/gatepass-list/gatepass-list.component';
import { GatepassCreateComponent } from './components/gatepass-create/gatepass-create.component';
import { GatepassVerifyComponent } from './components/gatepass-verify/gatepass-verify.component';

export const gatepassRoutes: Routes = [
    { path: 'create', component: GatepassCreateComponent },
  { path: 'create', component: GatepassCreateComponent },
  { path: 'verify', component: GatepassVerifyComponent },
];
