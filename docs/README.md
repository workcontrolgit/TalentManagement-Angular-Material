# TalentManagement Angular Application - Documentation

This folder contains comprehensive documentation for the Talent Management Angular application built with ng-matero template and Material Design.

## Documentation Index

### Quick Start & Development Guides

- **[00-claude-code-guide.md](00-claude-code-guide.md)** - Developer guide for working with Claude Code in this repository
  - Build commands, architecture overview, authentication setup
  - API integration patterns, component structures
  - Common issues and solutions

### Architecture & Planning

- **[01-project-architecture-plan.md](01-project-architecture-plan.md)** - Overall project architecture and implementation plan
  - System overview, technology stack
  - Feature breakdown, development roadmap
  - Database schema, API endpoints

### Feature Implementation Plans

- **[02-dashboard-frontend-plan.md](02-dashboard-frontend-plan.md)** - Dashboard feature implementation (Angular frontend)
  - Component structure, chart library integration
  - Data loading strategies, UI/UX design
  - Testing and performance optimization

- **[03-dashboard-api-implementation.md](03-dashboard-api-implementation.md)** - Dashboard API development (.NET backend)
  - Clean Architecture layers, DTOs and models
  - Repository and service implementation
  - SQL queries, caching, and optimization

- **[04-dashboard-implementation-summary.md](04-dashboard-implementation-summary.md)** - Dashboard implementation results and lessons learned

- **[05-profile-feature-plan.md](05-profile-feature-plan.md)** - User profile feature implementation plan
  - Profile overview and settings components
  - User preferences, password management
  - Role-based access control

- **[07-hr-app-implementation-summary.md](07-hr-app-implementation-summary.md)** - Complete HR application implementation summary
  - Employee, Department, Position, Salary Range CRUD
  - Authentication and authorization
  - Lessons learned and best practices

### Template & Setup Guides

- **[08-ng-matero-setup-guide.md](08-ng-matero-setup-guide.md)** - ng-matero template setup and configuration
  - Installation steps, project structure
  - Customization options, theme configuration
  - Integration with OIDC authentication

- **[09-ng-matero-template-checklist.md](09-ng-matero-template-checklist.md)** - Template feature checklist
  - Available components and modules
  - Material Design components
  - Authentication and routing features

## Document Organization

Documents are numbered for logical reading order:
- **00-0x**: Quick reference and development guides
- **01-0x**: Architecture and high-level planning
- **02-06**: Feature-specific implementation plans
- **07-09**: Implementation summaries and template guides

## Key Technologies

- **Frontend**: Angular 20, Material Design, ng-matero
- **Backend**: .NET Core, Clean Architecture
- **Authentication**: Duende IdentityServer, OIDC
- **Authorization**: ngx-permissions, role-based access
- **Charts**: Chart.js with ng2-charts

## Getting Started

1. Start with [00-claude-code-guide.md](00-claude-code-guide.md) for development environment setup
2. Review [01-project-architecture-plan.md](01-project-architecture-plan.md) for system overview
3. Check feature-specific plans (02-06) for implementation details
4. Refer to template guides (08-09) for customization options

## Contributing

When adding new documentation:
- Use descriptive filenames with number prefixes
- Include table of contents for long documents
- Add code examples and diagrams where appropriate
- Update this README with the new document

## Related Documentation

- Main project README: `../README.md`
- API documentation: See backend repository
- IdentityServer docs: See token service repository
