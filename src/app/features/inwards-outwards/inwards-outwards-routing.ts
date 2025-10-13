// src/app/features/inout/inout-routing.ts
import { Routes } from '@angular/router';
import { InwardsListComponent } from './components/inwards-list/inwards-list.component';
import { OutwardsListComponent } from './components/outwards-list/outwards-list.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const inoutRoutes: Routes = [
 {
  path: '',
  loadComponent: () =>
    import('./components/in-out-transactions/in-out-transactions.component')
      .then(m => m.InOutTransactionsComponent),
},
{
  path: 'inwards',
  loadComponent: () =>
    import('./components/inwards-list/inwards-list.component')
      .then(m => m.InwardsListComponent),
},
{
  path: 'outwards',
  loadComponent: () =>
    import('./components/outwards-list/outwards-list.component')
      .then(m => m.OutwardsListComponent),
},

];
