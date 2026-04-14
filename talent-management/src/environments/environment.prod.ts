export const environment = {
  production: true,
  baseUrl: '',
  useHash: false,

  // API Configuration
  apiUrl: 'https://your-production-api.com/api/v1',

  // Duende IdentityServer Configuration
  identityServerUrl: 'https://localhost:44310',
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',

  // Feature Flags
  allowAnonymousAccess: true,
  aiEnabled: true,
};
