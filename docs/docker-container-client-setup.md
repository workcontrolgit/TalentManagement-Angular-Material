# Docker Setup for Angular Client

> **Part of:** [AngularNetTutorial](https://github.com/workcontrolgit/AngularNetTutorial) - CAT Pattern Tutorial
> **See also:** [CLAUDE.md](../../CLAUDE.md) for architecture overview

This document tracks the tasks required to run the Talent Management Angular app with Docker.

## Scope
- Frontend project path: `talent-management`
- Host machine path: `C:\apps\AngularNetTutotial\Clients\TalentManagement-Angular-Material`
- Output goal: run app locally via Docker Compose

## Architecture Context

This Angular client is part of the **CAT (Client, API, Token Service) pattern**:
- **Frontend:** This Angular app (can run in Docker)
- **API:** TalentManagement-API (separate submodule at `../../ApiResources/TalentManagement-API`)
- **IdentityServer:** Authentication service (separate submodule at `../../TokenService/Duende-IdentityServer`)

### Current Docker Setup

**Your Environment:**
- ✅ **API:** Running in Docker Desktop at `https://localhost:44378`
- ✅ **IdentityServer (STS):** Running in Docker Desktop at `https://sts.skoruba.local` (via nginx proxy)
- 🎯 **Angular Client:** To be containerized (this guide)

**Docker Strategy:**
- All three services will run in Docker Desktop
- Angular connects to API and STS via browser-reachable URLs
- nginx-proxy container handles routing for `*.skoruba.local` domains

## Task Checklist

### 1. Pre-checks
- [ ] Docker Desktop is installed and running
- [ ] Docker Desktop is set to "Linux containers" mode (check Docker Desktop settings)
- [ ] WSL2 backend is enabled (recommended for Windows)
- [ ] File sharing enabled for `C:\apps\` in Docker Desktop settings
- [ ] `docker --version` works (should show Docker 20.10+ or later)
- [ ] `docker compose version` works (should show Docker Compose 2.0+ or later)
- [ ] Node/Angular local build is healthy (optional but recommended to verify app works before containerizing)

### 2. Inspect current repo state
- [ ] Check for existing `Dockerfile` in `talent-management`
- [ ] Check for existing `.dockerignore` in `talent-management`
- [ ] Check for existing `docker-compose.yml` in repo root
- [ ] Reuse existing files if valid; avoid duplicate compose stacks

### 3. Choose runtime mode

**Development Mode (Recommended for Tutorial):**
- [ ] Use `Development` mode (`ng serve` in container)
- [ ] Enables hot reload with volume mounts
- [ ] Port mapping: `4200:4200` (host:container)
- [ ] Uses `environment.ts` configuration

### 4. Create Docker artifacts

**Development Dockerfile** (`talent-management/Dockerfile`):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular dev server (accessible from host)
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
```

**Docker Ignore File** (`talent-management/.dockerignore`):
```
node_modules
dist
.angular
.git
.vscode
*.log
npm-debug.log*
.env
.env.local
coverage
.idea
```

**Docker Compose (Option A: Angular Only)** (`docker-compose.yml` in repo root):
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./talent-management
      dockerfile: Dockerfile
    container_name: talent-management-angular
    ports:
      - "4200:4200"
    volumes:
      - ./talent-management:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    networks:
      - talent-net

networks:
  talent-net:
    driver: bridge
```

**Tasks:**
- [ ] Create `talent-management/Dockerfile` (use development template above)
- [ ] Create `talent-management/.dockerignore` (use template above)
- [ ] Create `docker-compose.yml` in repo root (Option A only)
- [ ] Ensure `.gitattributes` has `* text=auto eol=lf` for consistent line endings
- [ ] Add optional `docker-compose.override.yml` for local customization

### 5. Verify Angular Configuration

**CRITICAL: Angular runs in the browser, not in the container.**
The browser makes requests to API and IdentityServer, so URLs must be browser-reachable.

**Verify Angular Configuration** (`talent-management/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44378/api/v1',  // ← Browser-reachable (API in Docker)
  identityServerUrl: 'https://sts.skoruba.local',  // ← Browser-reachable (STS in Docker via nginx)
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',
  allowAnonymousAccess: true,
};
```

**Tasks:**
- [ ] Verify `apiUrl` is `https://localhost:44378/api/v1` (API running in Docker Desktop)
- [ ] Verify `identityServerUrl` is `https://sts.skoruba.local` (STS running in Docker Desktop via nginx proxy)
- [ ] DO NOT change to Docker internal service names like `http://api:5000` - those won't work in browser
- [ ] Ensure Windows hosts file has entry: `127.0.0.1  sts.skoruba.local` (see troubleshooting for details)

**Note:** API and STS are already configured and running in Docker Desktop. No changes needed to their configuration unless you encounter CORS/authentication errors (see troubleshooting section).

### 6. Build and start
- [ ] Run `docker compose build`
- [ ] Run `docker compose up -d`
- [ ] Confirm container status with `docker compose ps`
- [ ] Review logs with `docker compose logs -f frontend`

### 7. Verify app
- [ ] Open app in browser on configured host port
- [ ] Validate login and dashboard load
- [ ] Validate API requests from browser dev tools
- [ ] Check no critical errors in browser console

### 8. Troubleshooting checklist

**Port Conflicts:**
- [ ] If port 4200 already in use, change in `docker-compose.yml`: `"4201:4200"`
- [ ] Run `netstat -ano | findstr :4200` to find conflicting process
- [ ] Kill process: `taskkill /PID <process-id> /F`

**Build Issues:**
- [ ] If build fails with package errors: `docker compose build --no-cache`
- [ ] If "permission denied": Check Docker Desktop file sharing for `C:\apps\`
- [ ] If line ending errors: Ensure `.gitattributes` has `* text=auto eol=lf`

**Runtime Issues:**
- [ ] If Angular won't start: `docker compose logs -f frontend` to see errors
- [ ] If "Cannot find module": Rebuild without cache: `docker compose build --no-cache frontend`
- [ ] If changes not appearing: Verify volume mounts in `docker-compose.yml` and `--poll` flag in Dockerfile CMD

**Network Issues:**
- [ ] If API requests fail: Check browser Network tab for CORS errors
- [ ] If CORS errors: See "CORS and Client Setup" section below
- [ ] If "Connection refused": Ensure API and IdentityServer Docker containers are running
- [ ] Browser can directly open `https://sts.skoruba.local` (IdentityServer) and `https://localhost:44378/swagger` (API)

**Authentication Issues:**
- [ ] If "invalid_scope": Verify `environment.ts` scope matches IdentityServer `AllowedScopes` (see CORS section below)
- [ ] If redirect loop: Check IdentityServer RedirectUris (see CORS section below)
- [ ] If logout fails: Check PostLogoutRedirectUris (see CORS section below)
- [ ] If "sts.skoruba.local not found": Add to hosts file (see CORS section below)

**CORS and Client Setup (If Authentication/CORS Issues Occur):**

The API and STS are already configured, but if you encounter issues, verify these settings:

**1. Check Windows Hosts File** (`C:\Windows\System32\drivers\etc\hosts`):

The `sts.skoruba.local` domain must resolve to localhost for your browser to reach the STS.

**Required entries:**
```
127.0.0.1    sts.skoruba.local
127.0.0.1    admin.skoruba.local
127.0.0.1    admin-api.skoruba.local
```

**Add via PowerShell (Run as Administrator):**
```powershell
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "`n127.0.0.1    sts.skoruba.local`n127.0.0.1    admin.skoruba.local`n127.0.0.1    admin-api.skoruba.local"
```

**Or edit manually:**
- Open Notepad as Administrator
- Open `C:\Windows\System32\drivers\etc\hosts`
- Add the three lines above
- Save and close

**2. Verify API CORS Configuration** (`ApiResources/TalentManagement-API/appsettings.json`):

Should allow Angular origin:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:4200",
      "https://localhost:4200"
    ]
  }
}
```

**3. Verify IdentityServer Client Configuration** (`TokenService/Duende-IdentityServer/shared/identityserverdata.json`):

The TalentManagement client should have:
```json
{
  "ClientId": "TalentManagement",
  "ClientName": "Talent Management Angular Client",
  "AllowedGrantTypes": ["authorization_code"],
  "RequirePkce": true,
  "RequireClientSecret": false,
  "AllowedScopes": [
    "openid",
    "profile",
    "email",
    "roles",
    "app.api.talentmanagement.read",
    "app.api.talentmanagement.write"
  ],
  "AllowedCorsOrigins": [
    "http://localhost:4200",
    "https://localhost:4200"
  ],
  "RedirectUris": [
    "http://localhost:4200/callback",
    "http://localhost:4200/silent-renew.html"
  ],
  "PostLogoutRedirectUris": [
    "http://localhost:4200",
    "http://localhost:4200/unauthorized"
  ],
  "AllowAccessTokensViaBrowser": true,
  "RequireConsent": false
}
```

**4. Verification Steps:**
- [ ] Open `https://sts.skoruba.local` in browser (should load IdentityServer page, not DNS error)
- [ ] Open `https://localhost:44378/swagger` in browser (should load API documentation)
- [ ] Check browser DevTools → Network tab for CORS errors during login
- [ ] Verify Angular `clientId` in `environment.ts` matches IdentityServer client configuration
- [ ] Verify Angular `scope` in `environment.ts` matches IdentityServer `AllowedScopes` exactly

**5. If Configuration Changes Are Needed:**

After modifying STS or API configuration files:

```powershell
# Restart STS container
cd C:\apps\AngularNetTutotial\TokenService\Duende-IdentityServer
docker compose restart duendeidentityserver.sts.identity

# Restart API container
cd C:\apps\AngularNetTutotial\ApiResources\TalentManagement-API
docker compose restart

# Verify containers are running
docker ps
```

**Environment File Selection:**
- [ ] Confirm Angular is using `environment.ts` (development) not `environment.prod.ts`
- [ ] Check container logs to see which environment was selected during build

### 9. Hot Reload Configuration (Development Mode)

For live code changes without rebuilding:

**package.json start script** (`talent-management/package.json`):
```json
{
  "scripts": {
    "start": "ng serve --host 0.0.0.0 --poll 2000"
  }
}
```

**Tasks:**
- [ ] Ensure volume mounts in `docker-compose.yml` include source code directory
- [ ] Ensure `node_modules` excluded from volume sync: `- /app/node_modules`
- [ ] Verify `--poll` flag in start script for Windows file watching
- [ ] Test: Make change to component, verify browser auto-refreshes

### 10. Documentation and handoff
- [ ] Add final run commands to `README.md` or docs
- [ ] Document required environment variables (if any)
- [ ] Document dev mode run flow
- [ ] Document dependency assumptions (API and STS already running in Docker)

## Quick Start Commands

### Angular Client Docker Setup

**Prerequisites:**
- ✅ API running in Docker Desktop at `https://localhost:44378`
- ✅ IdentityServer running in Docker Desktop at `https://sts.skoruba.local`
- ✅ Windows hosts file has `127.0.0.1  sts.skoruba.local` entry

```powershell
# From repo root
cd C:\apps\AngularNetTutotial\Clients\TalentManagement-Angular-Material

# Build the image
docker compose build

# Start the container
docker compose up -d

# Check container status
docker compose ps

# View logs
docker compose logs -f frontend

# Open browser
start http://localhost:4200
```

**Shutdown:**
```powershell
docker compose down
```

### Useful Commands

```powershell
# Rebuild without cache (if changes not appearing)
docker compose build --no-cache frontend

# Restart a single service
docker compose restart frontend

# Stop containers without removing them
docker compose stop

# Remove containers and networks
docker compose down

# Remove containers, networks, and volumes
docker compose down -v

# Execute command inside running container
docker compose exec frontend sh
docker compose exec frontend npm install

# View container resource usage
docker stats
```

## Completion Criteria
- [ ] App is accessible in browser through Docker
- [ ] Frontend loads without runtime blocking errors
- [ ] API calls succeed in target environment
- [ ] Team can reproduce startup using documented commands

## Dev Mode URL Strategy (Keep Existing STS/API URLs)

### Why URLs Don't Change

For this project, Angular runs in a container, but **the Angular code executes in the browser**. Because of that, Angular should continue using the same STS and Web API URLs that already work when Angular runs outside Docker.

### Rules

**✅ DO:**
- Keep existing browser-reachable URLs unchanged (e.g., `https://localhost:44378`, `https://localhost:44310`)
- Use Docker port mapping to make services available at their original ports
- Configure CORS to allow the Angular browser origin (`http://localhost:4200`)

**❌ DON'T:**
- Replace browser-facing STS/API URLs with Docker internal service names like `http://api:5000` in Angular environment files
- Change redirect URIs or CORS origins when moving Angular to Docker
- Use Docker service names in browser-executed code

**⚠️ EXCEPTION:**
- Use Docker internal service names only for server-to-server communication (e.g., API calling IdentityServer for token validation)

### URL Configuration Reference

| Service | Component | URL Type | Value | Location |
|---------|-----------|----------|-------|----------|
| IdentityServer | Browser | Authority | `https://localhost:44310` | `environment.ts` |
| IdentityServer | API Server | Authority | `https://localhost:44310` or `https://identityserver:443` | `appsettings.json` |
| API | Browser | Base URL | `https://localhost:44378/api/v1` | `environment.ts` |
| Angular | Browser | Origin | `http://localhost:4200` | CORS config in API/STS |

### Validation Checklist

- [ ] Confirm Angular `environment.ts` URL values match current working (non-containerized) values
- [ ] Confirm STS redirect URIs and post-logout redirect URIs still include the Angular browser URL (`http://localhost:4200/callback`)
- [ ] Confirm API and STS CORS allow the Angular browser origin (`http://localhost:4200`)
- [ ] Confirm browser can directly open STS URL (`https://localhost:44310`) and API health endpoint (`https://localhost:44378/swagger`)
- [ ] Confirm token acquisition and API calls work after Angular is moved to container
- [ ] Open browser DevTools → Network tab → verify Bearer tokens in API requests

