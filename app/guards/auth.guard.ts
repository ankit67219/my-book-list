import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Profile } from '../profile/profile';

// Guard to check if user is logged in
export const authGuard: CanActivateFn = () => {
  const profileService = inject(Profile);
  const router = inject(Router);

  if (profileService.isLoggedIn()) {
    return true;
  }

  alert('Please log in to access this page');
  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const profileService = inject(Profile);
  const router = inject(Router);

  if (!profileService.isLoggedIn()) {
    // User is NOT logged in → allow access
    return true;
  }

  // User IS logged in → block and redirect
  alert('You are already logged in');
  router.navigate(['/home']); // or wherever you want logged-in users to go
  return false;
};

export const Authome: CanActivateFn = () => {
  const profileService = inject(Profile);
  const router = inject(Router);

  if (profileService.isLoggedIn()) {
    return true;
  }

  alert('You have not logged in yet');
  return router.createUrlTree(['/link']);
};

export const Authbook: CanActivateFn = () => {
  const profileService = inject(Profile);
  const router = inject(Router);

  if (profileService.isLoggedIn()) {
    return true;
  }

  alert('You have not logged in yet');
  return router.createUrlTree(['/view-books']);
};
// Guard to check if user is admin
export const adminGuard: CanActivateFn = () => {
  const profileService = inject(Profile);
  const router = inject(Router);

  if (!profileService.isLoggedIn()) {
    alert('Please log in to access this page');
    router.navigate(['/login']);
    return false;
  }

  if (profileService.isAdmin()) {
    return true;
  }

  alert('Only administrators can access this page');
  router.navigate(['/home']);
  return false;
};
