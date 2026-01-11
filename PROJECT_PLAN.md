# NguyenCorpHR Angular Dashboard - Project Implementation Plan

## Project Overview

**Project Name:** NguyenCorpHR HR Management Dashboard
**Backend API:** Clean Architecture .NET Web API (https://localhost:44378)
**Frontend Framework:** Angular with ng-matero Dashboard Template
**Authentication:** Duende IdentityServer with Anonymous Access Support
**API Version:** v1

---

## API Analysis Summary

### Core Business Entities
The API manages an HR system with the following main entities:

1. **Employees** - Staff management with personal info, positions, salaries
2. **Departments** - Organizational units
3. **Positions** - Job positions with descriptions and salary ranges
4. **Salary Ranges** - Compensation bands for positions

### API Endpoints Summary

| Resource | Endpoints | Operations |
|----------|-----------|------------|
| **Employees** | `/api/v1/Employees` | GET (list), POST (create), GET by ID, PUT, DELETE |
| | `/api/v1/Employees/Paged` | POST (Ngx-DataTable pagination support) |
| **Departments** | `/api/v1/Departments` | Full CRUD operations |
| **Positions** | `/api/v1/Positions` | Full CRUD operations |
| | `/api/v1/Positions/AddMock` | POST (add mock data) |
| **Salary Ranges** | `/api/v1/SalaryRanges` | Full CRUD operations |
| **Meta** | `/info` | GET (API info) |

### Key Features Identified
- Pagination support (PageNumber, PageSize)
- Sorting (OrderBy parameter)
- Field selection (Fields parameter)
- Advanced filtering per entity
- Ngx-DataTable server-side pagination support
- Bearer JWT token authentication

### Data Models

#### Employee Fields
- firstName, middleName, lastName, prefix
- email, phone
- employeeNumber
- positionId (GUID reference)
- salary (decimal)
- birthday (datetime)
- gender (enum: Male=0, Female=1)

#### Position Fields
- positionTitle, positionNumber
- positionDescription
- departmentId (GUID reference)
- salaryRangeId (GUID reference)

#### Department Fields
- name

#### Salary Range Fields
- name
- minSalary, maxSalary (decimal)

---

## Technology Stack

### Frontend
- **Framework:** Angular (Latest - v18/v19)
- **UI Framework:** ng-matero (Angular Material Dashboard Template)
- **Authentication Library:** angular-oauth2-oidc (OIDC Code Flow + PKCE)
- **HTTP Client:** Angular HttpClient with interceptors
- **Data Tables:** Ngx-DataTable (already supported by API)
- **State Management:** RxJS + Angular Services
- **Forms:** Reactive Forms with Angular Material

### Authentication & Security
- **Identity Provider:** Duende IdentityServer
- **Protocol:** OpenID Connect (OIDC) with OAuth 2.0
- **Flow:** Authorization Code Flow with PKCE
- **Token Format:** JWT Bearer tokens
- **Anonymous Access:** Public routes for unauthenticated users

---

## Architecture & Design Decisions

### Authentication Strategy

#### Dual-Mode Authentication Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular App                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Anonymous Mode  │      │ Authenticated    │        │
│  │  - View only     │◄────►│ - Full CRUD      │        │
│  │  - Public routes │      │ - Protected API  │        │
│  └──────────────────┘      └──────────────────┘        │
│           │                          │                  │
│           │                          ▼                  │
│           │                 ┌─────────────────┐        │
│           │                 │ OIDC Auth       │        │
│           │                 │ Service         │        │
│           │                 └─────────────────┘        │
│           │                          │                 │
└───────────┼──────────────────────────┼─────────────────┘
            │                          │
            ▼                          ▼
   ┌────────────────┐         ┌──────────────────┐
   │  Public API    │         │ Duende Identity  │
   │  Endpoints     │         │ Server           │
   │  (if any)      │         │                  │
   └────────────────┘         └──────────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  NguyenCorpHR    │
                              │  WebAPI          │
                              │  (Protected)     │
                              └──────────────────┘
```

#### Authentication Features

1. **Anonymous User Experience**
   - View-only access to dashboard
   - Browse public employee directory (if allowed)
   - View department/position information
   - Prominent "Login" button in toolbar
   - Limited navigation menu

2. **Authenticated User Experience**
   - Full CRUD operations on all entities
   - Access to all features
   - User profile display
   - Logout functionality
   - Role-based permissions (future enhancement)

3. **OIDC Configuration**
   ```typescript
   {
     issuer: 'https://your-identity-server',
     clientId: 'nguyencorphr-angular-client',
     responseType: 'code',
     redirectUri: window.location.origin + '/callback',
     scope: 'openid profile email api',
     useSilentRefresh: true,
     requireHttps: true,
     strictDiscoveryDocumentValidation: false
   }
   ```

### HTTP Interceptor Strategy

1. **Auth Interceptor** - Inject Bearer token for authenticated requests
2. **Error Interceptor** - Handle 401/403 responses, redirect to login
3. **Loading Interceptor** - Show/hide loading indicators
4. **Anonymous Access Interceptor** - Skip auth for public routes

### Route Protection

```typescript
// Public routes (anonymous access)
- /home (dashboard view-only)
- /login
- /callback (OIDC redirect)
- /public/** (any public pages)

// Protected routes (require authentication)
- /employees/create
- /employees/edit/:id
- /departments/manage
- /positions/manage
- /salary-ranges/manage
```

---

## Project Phases

## PHASE 1: Project Initialization & Setup
**Duration:** 2-3 days
**Status:** Pending Approval

### 1.1 Angular Project Initialization
- [ ] Create new Angular project (latest version)
- [ ] Install ng-matero via `ng add ng-matero` or clone starter
- [ ] Choose theme configuration (light/dark)
- [ ] Configure project structure

### 1.2 Dependencies Installation
```bash
# Core dependencies
npm install angular-oauth2-oidc
npm install @swimlane/ngx-datatable
npm install date-fns

# Development dependencies
npm install --save-dev @types/node
```

### 1.3 Environment Configuration
- [ ] Configure environment files (dev, staging, prod)
- [ ] Set API base URL: `https://localhost:44378`
- [ ] Configure Duende IdentityServer settings
- [ ] Set up CORS handling with backend team

**Environment Variables:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44378/api/v1',
  identityServerUrl: 'https://your-identity-server',
  clientId: 'nguyencorphr-angular-client',
  scope: 'openid profile email api',
  allowAnonymousAccess: true
};
```

### 1.4 ng-matero Customization
- [ ] Customize theme colors
- [ ] Configure navigation menu structure
- [ ] Set up layout (sidebar, toolbar, footer)
- [ ] Remove unnecessary demo components

**Deliverables:**
- ✓ Working Angular application
- ✓ ng-matero dashboard configured
- ✓ Environment settings configured
- ✓ Development server running

---

## PHASE 2: Authentication Implementation
**Duration:** 3-4 days
**Status:** Pending Approval

### 2.1 OIDC Integration
- [ ] Install and configure angular-oauth2-oidc
- [ ] Create AuthService with OIDC configuration
- [ ] Implement login/logout flows
- [ ] Configure PKCE for security
- [ ] Test token acquisition and refresh

### 2.2 Anonymous Access Support
- [ ] Create AnonymousGuard for public routes
- [ ] Create AuthGuard for protected routes
- [ ] Implement route-based access control
- [ ] Create "Continue as Guest" functionality
- [ ] Design anonymous user UI (limited features)

### 2.3 HTTP Interceptors
- [ ] AuthInterceptor - Add Bearer token to requests
- [ ] ErrorInterceptor - Handle auth errors (401/403)
- [ ] LoadingInterceptor - Show loading spinner
- [ ] Create interceptor for anonymous mode handling

### 2.4 User Session Management
- [ ] Implement token storage (sessionStorage/localStorage)
- [ ] Add silent token refresh
- [ ] Handle token expiration
- [ ] Implement logout cleanup
- [ ] Add session timeout warning

### 2.5 UI Components
- [ ] Create login page/dialog
- [ ] Add user profile menu (for authenticated users)
- [ ] Create "Login" button (for anonymous users)
- [ ] Add authentication status indicator
- [ ] Create callback/redirect page

**Deliverables:**
- ✓ Working OIDC authentication
- ✓ Anonymous access mode functional
- ✓ Login/logout flows working
- ✓ Token management implemented
- ✓ HTTP interceptors configured

---

## PHASE 3: API Integration Layer
**Duration:** 3-4 days
**Status:** Pending Approval

### 3.1 TypeScript Models Generation
- [ ] Generate interfaces from Swagger spec
- [ ] Create enums (Gender, etc.)
- [ ] Define request/response models
- [ ] Create pagination models
- [ ] Define error models (ProblemDetails)

**Models to Create:**
```typescript
// Core entities
- Employee (CreateEmployeeCommand, UpdateEmployeeCommand)
- Department (CreateDepartmentCommand, UpdateDepartmentCommand)
- Position (CreatePositionCommand, UpdatePositionCommand)
- SalaryRange (CreateSalaryRangeCommand, UpdateSalaryRangeCommand)

// Supporting models
- PagedEmployeesQuery
- QueryParameter
- PagingParameter
- SortOrder, Column, Search
- Gender (enum)
- ProblemDetails
```

### 3.2 Base API Service
- [ ] Create BaseApiService with common methods
- [ ] Implement GET, POST, PUT, DELETE methods
- [ ] Add pagination support
- [ ] Implement sorting and filtering
- [ ] Add error handling

### 3.3 Entity-Specific Services
- [ ] EmployeeService (all employee operations)
- [ ] DepartmentService (department CRUD)
- [ ] PositionService (position CRUD + mock data)
- [ ] SalaryRangeService (salary range CRUD)
- [ ] MetaService (API info)

### 3.4 Service Features
- [ ] Implement caching where appropriate
- [ ] Add retry logic for failed requests
- [ ] Create loading state management
- [ ] Implement optimistic updates
- [ ] Add data validation

**Deliverables:**
- ✓ Complete TypeScript models
- ✓ All API services implemented
- ✓ API connectivity tested
- ✓ Error handling working

---

## PHASE 4: Core Features - Employee Management
**Duration:** 5-6 days
**Status:** Pending Approval

### 4.1 Employee List Page (Primary Focus)
- [ ] Use ng-matero schematics to generate employee module
- [ ] Implement Ngx-DataTable integration
- [ ] Connect to `/api/v1/Employees/Paged` endpoint
- [ ] Add server-side pagination
- [ ] Implement sorting (by name, email, position, etc.)
- [ ] Add search/filtering functionality
- [ ] Create custom columns display

**Features:**
- Employee number, name, email, phone
- Position title
- Department
- Salary (with formatting)
- Gender display
- Actions column (edit, delete for authenticated users)
- Anonymous mode: Read-only table

### 4.2 Employee Detail/View Page
- [ ] Create detail component
- [ ] Display full employee information
- [ ] Show related position details
- [ ] Display department information
- [ ] Add navigation breadcrumbs
- [ ] Anonymous mode: Full view access

### 4.3 Employee Create Form
- [ ] Create reactive form with Material components
- [ ] Add all employee fields
- [ ] Implement form validation
- [ ] Add position dropdown (populate from API)
- [ ] Add department selection
- [ ] Implement date picker for birthday
- [ ] Add gender radio buttons/select
- [ ] Implement salary input with formatting
- [ ] Add email/phone validation
- [ ] Protected: Require authentication

### 4.4 Employee Edit Form
- [ ] Reuse create form component
- [ ] Pre-populate with existing data
- [ ] Implement update functionality
- [ ] Add change tracking
- [ ] Show confirmation before save
- [ ] Protected: Require authentication

### 4.5 Employee Delete
- [ ] Create confirmation dialog
- [ ] Implement delete functionality
- [ ] Show success/error messages
- [ ] Refresh list after deletion
- [ ] Protected: Require authentication

**Deliverables:**
- ✓ Complete employee management module
- ✓ CRUD operations working
- ✓ Ngx-DataTable integrated
- ✓ Forms validated
- ✓ Anonymous vs authenticated access working

---

## PHASE 5: Supporting Entities Management
**Duration:** 4-5 days
**Status:** Pending Approval

### 5.1 Departments Module
- [ ] Generate module using ng-matero schematics
- [ ] Create department list with Material Table
- [ ] Implement CRUD operations
- [ ] Add pagination and sorting
- [ ] Create simple form (name only)
- [ ] Add validation
- [ ] Protected: Create/Edit/Delete require auth
- [ ] Anonymous: View-only access

### 5.2 Positions Module
- [ ] Generate positions module
- [ ] Create positions list
- [ ] Implement CRUD operations
- [ ] Add department dropdown
- [ ] Add salary range dropdown
- [ ] Create position form (title, number, description)
- [ ] Add "Add Mock Data" feature
- [ ] Protected: Manage positions require auth
- [ ] Anonymous: View positions

### 5.3 Salary Ranges Module
- [ ] Generate salary ranges module
- [ ] Create salary ranges list
- [ ] Implement CRUD operations
- [ ] Add currency formatting
- [ ] Validate min < max salary
- [ ] Create simple form
- [ ] Protected: CRUD require auth
- [ ] Anonymous: View-only

### 5.4 Cross-Module Features
- [ ] Implement cascading dropdowns
- [ ] Add data validation (referential integrity)
- [ ] Create reusable form components
- [ ] Add breadcrumb navigation
- [ ] Implement "back to list" functionality

**Deliverables:**
- ✓ All supporting modules complete
- ✓ CRUD operations for all entities
- ✓ Forms with validation
- ✓ Proper data relationships

---

## PHASE 6: Dashboard & Analytics
**Duration:** 3-4 days
**Status:** Pending Approval

### 6.1 Main Dashboard Page
- [ ] Customize ng-matero dashboard
- [ ] Create summary statistics cards:
  - Total Employees
  - Total Departments
  - Total Positions
  - Active Positions (not yet filled)
- [ ] Add recent employees widget
- [ ] Create department distribution chart
- [ ] Add salary distribution visualization
- [ ] Accessible to anonymous users (read-only)

### 6.2 Data Visualization
- [ ] Install charting library (Chart.js or ngx-charts)
- [ ] Create employee by department chart
- [ ] Add gender distribution pie chart
- [ ] Create salary range histogram
- [ ] Add position vacancy chart
- [ ] Make charts interactive

### 6.3 Quick Actions Panel
- [ ] Add quick links (for authenticated users)
- [ ] Create "Add Employee" quick action
- [ ] Add "Add Position" quick action
- [ ] Create recent activity feed
- [ ] Anonymous mode: Hide quick actions, show login prompt

**Deliverables:**
- ✓ Interactive dashboard
- ✓ Data visualizations
- ✓ Summary statistics
- ✓ Quick actions for authenticated users

---

## PHASE 7: Advanced Features & UX
**Duration:** 3-4 days
**Status:** Pending Approval

### 7.1 Search & Filters
- [ ] Create global search component
- [ ] Implement advanced filters dialog
- [ ] Add date range filtering
- [ ] Create salary range filter
- [ ] Add department/position filters
- [ ] Save filter preferences

### 7.2 Data Export
- [ ] Add export to Excel functionality
- [ ] Implement CSV export
- [ ] Add PDF generation for reports
- [ ] Create print-friendly views
- [ ] Protected: Require authentication for export

### 7.3 User Experience Enhancements
- [ ] Add keyboard shortcuts
- [ ] Implement drag-and-drop (if applicable)
- [ ] Add tooltips and help text
- [ ] Create loading skeletons
- [ ] Implement empty states
- [ ] Add error boundaries
- [ ] Create 404 page
- [ ] Add breadcrumb navigation

### 7.4 Notifications System
- [ ] Integrate ng-matero notification system
- [ ] Add success messages (CRUD operations)
- [ ] Implement error notifications
- [ ] Create warning dialogs
- [ ] Add toast notifications

### 7.5 Responsive Design
- [ ] Test mobile layouts (ng-matero is responsive)
- [ ] Optimize table views for mobile
- [ ] Create mobile-friendly forms
- [ ] Test tablet views
- [ ] Adjust dashboard for small screens

**Deliverables:**
- ✓ Advanced search working
- ✓ Export functionality
- ✓ Responsive design
- ✓ Notifications system
- ✓ Enhanced UX

---

## PHASE 8: Testing & Quality Assurance
**Duration:** 4-5 days
**Status:** Pending Approval

### 8.1 Unit Testing
- [ ] Write service unit tests
- [ ] Test API integration
- [ ] Test authentication flows
- [ ] Test form validation
- [ ] Test interceptors
- [ ] Test anonymous access logic
- [ ] Target: 70%+ code coverage

### 8.2 Component Testing
- [ ] Test employee components
- [ ] Test department components
- [ ] Test position components
- [ ] Test salary range components
- [ ] Test dashboard components
- [ ] Test authentication components

### 8.3 End-to-End Testing
- [ ] Set up Cypress or Playwright
- [ ] Test complete user flows
- [ ] Test CRUD operations
- [ ] Test authentication flow
- [ ] Test anonymous user journey
- [ ] Test form submissions
- [ ] Test error scenarios

### 8.4 Cross-Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile browsers

### 8.5 Performance Testing
- [ ] Test with large datasets
- [ ] Measure initial load time
- [ ] Test pagination performance
- [ ] Check bundle size
- [ ] Optimize if needed
- [ ] Test API response times

### 8.6 Security Testing
- [ ] Test authentication bypass attempts
- [ ] Verify token handling
- [ ] Test CSRF protection
- [ ] Check XSS vulnerabilities
- [ ] Verify input sanitization
- [ ] Test unauthorized access attempts
- [ ] Verify anonymous mode restrictions

**Deliverables:**
- ✓ Unit tests written
- ✓ E2E tests created
- ✓ Cross-browser compatibility
- ✓ Performance optimized
- ✓ Security validated

---

## PHASE 9: Documentation & Deployment
**Duration:** 2-3 days
**Status:** Pending Approval

### 9.1 Technical Documentation
- [ ] Document project structure
- [ ] Create API service documentation
- [ ] Document authentication flow
- [ ] Create deployment guide
- [ ] Document environment setup
- [ ] Create troubleshooting guide

### 9.2 User Documentation
- [ ] Create user manual
- [ ] Document features
- [ ] Create quick start guide
- [ ] Add screenshots/videos
- [ ] Document anonymous vs authenticated features

### 9.3 Build Configuration
- [ ] Configure production builds
- [ ] Set up environment-specific builds
- [ ] Optimize bundle size
- [ ] Enable production mode
- [ ] Configure source maps (for debugging)

### 9.4 Deployment Setup
- [ ] Choose hosting platform (Azure, AWS, Netlify, etc.)
- [ ] Configure CI/CD pipeline
- [ ] Set up staging environment
- [ ] Configure production environment
- [ ] Set up SSL certificates
- [ ] Configure domain

### 9.5 Post-Deployment
- [ ] Deploy to staging
- [ ] Perform smoke testing
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Set up logging and monitoring

**Deliverables:**
- ✓ Complete documentation
- ✓ Deployment pipeline
- ✓ Production deployment
- ✓ Monitoring setup

---

## Project Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Project Setup | 2-3 days | Pending Approval |
| 2. Authentication | 3-4 days | Pending Approval |
| 3. API Integration | 3-4 days | Pending Approval |
| 4. Employee Management | 5-6 days | Pending Approval |
| 5. Supporting Entities | 4-5 days | Pending Approval |
| 6. Dashboard | 3-4 days | Pending Approval |
| 7. Advanced Features | 3-4 days | Pending Approval |
| 8. Testing & QA | 4-5 days | Pending Approval |
| 9. Documentation & Deployment | 2-3 days | Pending Approval |
| **TOTAL** | **29-38 days** | **~6-8 weeks** |

---

## Technical Decisions Summary

### ✅ Approved Technology Choices

1. **ng-matero Dashboard** - Feature-rich Angular Material template
2. **angular-oauth2-oidc** - Industry standard for OIDC in Angular
3. **Ngx-DataTable** - Already supported by your API
4. **Reactive Forms** - Better for complex forms with validation
5. **Authorization Code Flow + PKCE** - Most secure for SPAs
6. **RxJS for State Management** - Built into Angular, sufficient for this app

### 🔄 Decisions Requiring Client Input

1. **Duende IdentityServer Configuration**
   - What is the IdentityServer URL?
   - What is the client ID for this Angular app?
   - What scopes are available?
   - Is client registration already done?

2. **Anonymous Access Rules**
   - Which endpoints/features should be public?
   - Should anonymous users see employee data?
   - Any restrictions on data visibility?

3. **Role-Based Access Control**
   - Will there be different user roles (Admin, HR, Manager, etc.)?
   - Should role-based permissions be implemented now or later?

4. **Deployment Platform**
   - Where will this be hosted? (Azure, AWS, on-premise, etc.)
   - What is the production URL?

5. **Branding & Theming**
   - Company logo and colors?
   - Specific branding requirements?

---

## Risk Assessment & Mitigation

### Potential Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Duende IdentityServer integration issues | High | Medium | Early prototype, dedicated testing phase |
| API CORS configuration problems | High | Medium | Coordinate with backend team early |
| Anonymous access security concerns | High | Low | Implement proper guards and interceptors |
| Performance issues with large datasets | Medium | Medium | Implement virtual scrolling, lazy loading |
| Browser compatibility issues | Low | Low | Use ng-matero (already tested), automated testing |

---

## Success Criteria

### Must-Have Features
- ✓ Working authentication with Duende IdentityServer
- ✓ Anonymous user access (view-only mode)
- ✓ Complete CRUD for all entities (Employees, Departments, Positions, Salary Ranges)
- ✓ Responsive design (mobile, tablet, desktop)
- ✓ Data validation and error handling
- ✓ Secure API integration with Bearer tokens

### Nice-to-Have Features
- Data export (Excel, CSV, PDF)
- Advanced search and filtering
- Data visualizations and charts
- Real-time updates
- Audit logging
- Role-based access control (future enhancement)

---

## Next Steps - Awaiting Approval

Please review this plan and provide:

1. **Approval to proceed** with this plan
2. **Duende IdentityServer configuration details**:
   - IdentityServer URL
   - Client ID
   - Available scopes
   - Any specific OIDC requirements

3. **Anonymous access requirements**:
   - Which features should be public?
   - Data visibility rules for unauthenticated users

4. **Priority adjustments** (if any phases should be reordered)

5. **Any additional requirements** not covered in this plan

Once approved, I will proceed with Phase 1: Project Initialization & Setup.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Status:** Awaiting Client Review & Approval
