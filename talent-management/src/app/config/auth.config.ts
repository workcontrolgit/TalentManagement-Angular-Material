import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

// Base URL including subfolder (e.g. /AngularNetTutorial/ on GitHub Pages)
const appBaseUrl = document.baseURI.endsWith('/') ? document.baseURI.slice(0, -1) : document.baseURI;

export const authConfig: AuthConfig = {
  // Duende IdentityServer URL
  issuer: environment.identityServerUrl,

  // URL of the Angular app (where IdentityServer will redirect after login)
  redirectUri: appBaseUrl + '/callback',

  // URL to redirect after logout
  postLogoutRedirectUri: appBaseUrl,

  // The Angular app's client ID as registered with IdentityServer
  clientId: environment.clientId,

  // Requested scopes
  scope: environment.scope,

  // Use Authorization Code Flow with PKCE (most secure for SPAs)
  responseType: 'code',

  // Show debug information in console (disable in production)
  showDebugInformation: !environment.production,

  // Enable silent refresh for automatic token renewal
  useSilentRefresh: true,

  // Silent refresh redirect URI
  silentRefreshRedirectUri: appBaseUrl + '/silent-refresh.html',

  // Time before token expires to trigger silent refresh (in seconds)
  silentRefreshTimeout: 5000,

  // Timeout for silent refresh (in milliseconds)
  timeoutFactor: 0.75,

  // Session checks interval (in milliseconds)
  sessionChecksEnabled: true,

  // Clear hash after login
  clearHashAfterLogin: true,

  // Disable strict discovery document validation for local development
  strictDiscoveryDocumentValidation: false,

  // Skip issuer check (only for local development with localhost)
  skipIssuerCheck: !environment.production,

  // Require HTTPS (should be true in production)
  requireHttps: environment.production,

  // Request access token
  requestAccessToken: true,

  // Use HTTP Basic Auth for token requests
  dummyClientSecret: undefined,

  // Custom query parameters
  customQueryParams: {},
};
