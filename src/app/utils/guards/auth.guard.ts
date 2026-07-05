import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { selectProfileRole } from '../store/profile/profile.selector';

export const authGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const store = inject(Store);

  const requiredRoles = route.data['roles'] as Role[] | undefined;

  if (sessionStorage.getItem("access_token"))
    if (requiredRoles && requiredRoles.length !== 0) {
      if (requiredRoles.some(r => store.selectSignal(selectProfileRole)() === r)) {
        return true;
      }
    }

  

  router.navigate(['/login']);
  return false;
};
