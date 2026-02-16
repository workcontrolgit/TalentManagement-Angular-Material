export const environment = {
  production: true,
  baseUrl: '',
  useHash: false,

  // API Configuration
  apiUrl: 'https://your-production-api.com/api/v1',

  // Duende IdentityServer Configuration
  identityServerUrl: 'https://sts.skoruba.local',
  clientId: 'TalentManagement',
  scope: 'openid profile email api',

  // Feature Flags
  allowAnonymousAccess: false,
};
