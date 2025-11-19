import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../features/user-management/services/user.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  let user = auth.getCurrentUser();

  // 🔹 Check localStorage if empty
  if (!user) {
    const saved = localStorage.getItem("current_user");
    if (saved) {
      user = JSON.parse(saved);
      auth['currentUserSignal'].set(user);
      auth['isAuthenticatedSignal'].set(true);
    }
  }

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  // 🔍 Fetch latest user from DB
  const dbUser = await userService.getUserById(user.id!);

  // ❌ If not active → logout
  if (!dbUser || dbUser.is_active === false) {
    auth.logout();
    return false;
  }

  return true;
};
