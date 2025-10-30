// src/app/features/gate-pass/gate-pass-routing.ts
import { Routes } from '@angular/router';
import { GatepassListComponent } from './components/gatepass-list/gatepass-list.component';
import { GatepassCreateComponent } from './components/gatepass-create/gatepass-create.component';
import { GatepassVerifyComponent } from './components/gatepass-verify/gatepass-verify.component';
import { GatepassReceiptComponent } from './components/gatepass-receipt/gatepass-receipt.component';

export const gatepassRoutes: Routes = [
    { path: '', component: GatepassListComponent },
  { path: 'create', component: GatepassCreateComponent },
  { path: 'verify', component: GatepassVerifyComponent },
  { path: 'receipt/:pass_number', component: GatepassReceiptComponent },
];
