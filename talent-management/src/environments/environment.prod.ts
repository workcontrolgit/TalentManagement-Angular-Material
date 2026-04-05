export const environment = {
  production: true,
  baseUrl: '',
  useHash: false,

  // API Configuration
  apiUrl: 'https://app-talent-api-dev.azurewebsites.net/api/v1',

  // Duende IdentityServer Configuration
  identityServerUrl: 'https://app-talent-ids-dev.azurewebsites.net',
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',

  // Feature Flags
  allowAnonymousAccess: false,
};
