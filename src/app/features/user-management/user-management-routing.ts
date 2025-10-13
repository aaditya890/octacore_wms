// src/app/features/user-management/user-management-routing.ts
import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserCreateComponent } from './components/user-create/user-create.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const userManagementRoutes: Routes = [
  { path: '', component: UserListComponent },
  { path: 'create', component: UserCreateComponent },
  { path: 'profile/:id', component: UserProfileComponent }
];
