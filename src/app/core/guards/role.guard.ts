import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../features/user-management/services/user.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const userService = inject(UserService);

    const user = auth.getCurrentUser();

    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    // 🔍 DB fresh check
    const dbUser = await userService.getUserById(user.id!);

    if (!dbUser || dbUser.is_active === false) {
      auth.logout();
      return false;
    }

    // 🔐 Role verification
    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
