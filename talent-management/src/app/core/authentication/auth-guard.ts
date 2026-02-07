import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OidcAuthService } from './oidc-auth.service';
import { environment } from '../../../environments/environment';

export const authGuard = (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) => {
  const oidcAuth = inject(OidcAuthService);

  // Allow anonymous access if configured in environment
  if (environment.allowAnonymousAccess) {
    return true;
  }

  // Check if user is authenticated via OIDC
  if (oidcAuth.isAuthenticated()) {
    return true;
  }

  // Redirect to IdentityServer for authentication
  // Pass the target URL so user is redirected back after login
  oidcAuth.login(state?.url);
  return false;
};
