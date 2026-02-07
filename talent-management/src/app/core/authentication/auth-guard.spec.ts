import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { authGuard } from './auth-guard';
import { OidcAuthService } from './oidc-auth.service';

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

    expect(authGuard(route, state)).toBeTrue();
  });

  it('should redirect to /login when not authenticated and anonymous access disabled', () => {
    spyOn(oidcAuthService, 'isAuthenticated').and.returnValue(false);

    const result = authGuard(route, state);
    expect(result.toString()).toBe('/login');
  });
});
