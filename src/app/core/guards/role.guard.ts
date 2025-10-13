import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.getCurrentUser();

    if (user && auth.hasRole(...allowedRoles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
