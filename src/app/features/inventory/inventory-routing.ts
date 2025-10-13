// src/app/features/inventory/inventory-routing.ts
import { Routes } from '@angular/router';
import { InventoryListComponent } from './components/inventory-list/inventory-list.component';
import { InventoryAddComponent } from './components/inventory-add/inventory-add.component';
import { InventoryDetailComponent } from './components/inventory-detail/inventory-detail.component';
import { roleGuard } from '../../core/guards/role.guard';
import { authGuard } from '../../core/guards/auth.guard';

export const inventoryRoutes: Routes = [
{ path: '', component: InventoryListComponent, canActivate: [authGuard, roleGuard(['admin', 'manager', 'staff', 'viewer'])] },
  { path: 'add', component: InventoryAddComponent, canActivate: [authGuard, roleGuard(['admin', 'manager'])] },
  { path: 'edit/:id', component: InventoryAddComponent, canActivate: [authGuard, roleGuard(['admin', 'manager'])] },
{ path: 'detail/:id', component: InventoryDetailComponent, canActivate: [authGuard, roleGuard(['admin', 'manager', 'staff', 'viewer'])] },

];
