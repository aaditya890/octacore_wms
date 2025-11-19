// src/app/features/user-management/user-management-routing.ts
import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserCreateComponent } from './components/user-create/user-create.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const userManagementRoutes: Routes = [
 {
    path: '',
    loadComponent: () =>
      import('./components/user-list/user-list.component')
        .then(m => m.UserListComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/user-create/user-create.component')
        .then(m => m.UserCreateComponent)
  },
  {
    path: 'profile/:id',
    loadComponent: () =>
      import('./components/user-profile/user-profile.component')
        .then(m => m.UserProfileComponent)
  },
];
