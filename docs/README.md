# TalentManagement Angular Application - Documentation

This folder contains comprehensive documentation for the Talent Management Angular application built with ng-matero template and Material Design.

## Documentation Index

### Quick Start & Development Guides

- **[claude-code-guide.md](claude-code-guide.md)** - Developer guide for working with Claude Code in this repository
  - Build commands, architecture overview, authentication setup
  - API integration patterns, component structures
  - Common issues and solutions

### Feature Implementation Plans

- **[dashboard-frontend-plan.md](dashboard-frontend-plan.md)** - Dashboard feature implementation (Angular frontend)
  - Component structure, chart library integration
  - Data loading strategies, UI/UX design
  - Testing and performance optimization

- **[dashboard-api-implementation.md](dashboard-api-implementation.md)** - Dashboard API development (.NET backend)
  - Clean Architecture layers, DTOs and models
  - Repository and service implementation
  - SQL queries, caching, and optimization

- **[dashboard-implementation-summary.md](dashboard-implementation-summary.md)** - Dashboard implementation results and lessons learned

- **[profile-feature-plan.md](profile-feature-plan.md)** - User profile feature implementation plan
  - Profile overview and settings components
  - User preferences, password management
  - Role-based access control

### Implementation Summaries

- **[hr-app-implementation-summary.md](hr-app-implementation-summary.md)** - Complete HR application implementation summary
  - Employee, Department, Position, Salary Range CRUD
  - Authentication and authorization
  - Lessons learned and best practices

### Template & Setup Guides

- **[ng-matero-setup-guide.md](ng-matero-setup-guide.md)** - ng-matero template setup and configuration
  - Installation steps, project structure
  - Customization options, theme configuration
  - Integration with OIDC authentication

- **[ng-matero-template-checklist.md](ng-matero-template-checklist.md)** - Template feature checklist
  - Available components and modules
  - Material Design components
  - Authentication and routing features

## Key Technologies

- **Frontend**: Angular 20, Material Design, ng-matero
- **Backend**: .NET Core, Clean Architecture
- **Authentication**: Duende IdentityServer, OIDC
- **Authorization**: ngx-permissions, role-based access
- **Charts**: Chart.js with ng2-charts

## Getting Started

1. Start with [claude-code-guide.md](claude-code-guide.md) for development environment setup
2. Review feature-specific plans for implementation details
3. Check implementation summaries for lessons learned
4. Refer to template guides for ng-matero customization options

## Contributing

When adding new documentation:
- Use descriptive filenames (kebab-case)
- Include table of contents for long documents
- Add code examples and diagrams where appropriate
- Update this README with the new document

## Related Documentation

- Main project README: `../README.md`
- API documentation: See backend repository
- IdentityServer docs: See token service repository
