import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();

  if (!user) {
    const savedUser = localStorage.getItem("current_user");
    if (savedUser) {
      auth['currentUserSignal'].set(JSON.parse(savedUser));
      auth['isAuthenticatedSignal'].set(true);
      return true;
    } else {
      router.navigate(['/auth/login']);
      return false;
    }
  }

  return true;
};
