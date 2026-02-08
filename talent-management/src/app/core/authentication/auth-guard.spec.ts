import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { authGuard } from './auth-guard';
import { OidcAuthService } from './oidc-auth.service';
import { environment } from '../../../environments/environment';

@Component({
  template: '',
  imports: [],
})
class Dummy {}

describe('authGuard function unit test', () => {
  const route: any = {};
  const state: any = {};
  let router: Router;
  let oidcAuthService: OidcAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Dummy],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideOAuthClient(),
        provideRouter([
          { path: 'dashboard', component: Dummy, canActivate: [authGuard] },
          { path: 'login', component: Dummy },
        ]),
      ],
    });
    TestBed.createComponent(Dummy);
    router = TestBed.inject(Router);
    oidcAuthService = TestBed.inject(OidcAuthService);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    spyOn(oidcAuthService, 'isAuthenticated').and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeTrue();
  });

  it('should call oidcAuth.login() when not authenticated and anonymous access disabled', () => {
    // Temporarily disable anonymous access for this test
    const originalValue = environment.allowAnonymousAccess;
    environment.allowAnonymousAccess = false;

    spyOn(oidcAuthService, 'isAuthenticated').and.returnValue(false);
    spyOn(oidcAuthService, 'login');

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(oidcAuthService.login).toHaveBeenCalled();
    expect(result).toBeFalse();

    // Restore original value
    environment.allowAnonymousAccess = originalValue;
  });
});
