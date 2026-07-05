import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { selectProfileLoading, selectProfileRole } from '../store/profile/profile.selector';
import { combineLatest, filter, first, map } from 'rxjs';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const store = inject(Store);

  // No token → reject immediately without waiting
  if (!sessionStorage.getItem('access_token')) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as Role[] | undefined;

  // No role restriction — token alone is sufficient
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Wait until the profile has finished loading (autoLogin triggers an async fetch),
  // then check whether the resolved role satisfies the route's required roles.
  return combineLatest([
    store.select(selectProfileRole),
    store.select(selectProfileLoading),
  ]).pipe(
    filter(([role, loading]) => !loading && role !== null),
    first(),
    map(([role]) => {
      if (requiredRoles.some(r => role === r)) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
