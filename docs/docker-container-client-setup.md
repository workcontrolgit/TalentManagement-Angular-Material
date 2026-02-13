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

### Docker Strategy Options

**Option A: Angular Only in Docker** (Recommended for getting started)
- [ ] Run Angular in Docker container
- [ ] API and IdentityServer run on host machine
- [ ] Angular uses existing URLs: `https://localhost:44378` (API), `https://localhost:44310` (STS)

**Option B: Full Stack in Docker**
- [ ] Run all three services in Docker Compose
- [ ] Still use `localhost` URLs (port mapped from containers)
- [ ] More complex but closer to production deployment

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

**Production Mode (Optional):**
- [ ] Use `Production` mode (Angular build + Nginx serve)
- [ ] Smaller image size, no development dependencies
- [ ] Port mapping: `8080:80` (host:container)
- [ ] Uses `environment.prod.ts` configuration

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

**Docker Compose - Option A: Angular Only** (`docker-compose.yml` in repo root):
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

**Docker Compose - Option B: Full Stack** (`docker-compose.yml` in repo root):
```yaml
version: '3.8'

services:
  identityserver:
    build:
      context: ./TokenService/Duende-IdentityServer
      dockerfile: Dockerfile
    container_name: talent-identityserver
    ports:
      - "44310:443"
      - "44303:44303"  # Admin UI
      - "44302:44302"  # Admin API
    networks:
      - talent-net

  api:
    build:
      context: ./ApiResources/TalentManagement-API
      dockerfile: Dockerfile
    container_name: talent-api
    ports:
      - "44378:443"
    depends_on:
      - identityserver
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - IdentityServer__Authority=https://localhost:44310
    networks:
      - talent-net

  frontend:
    build:
      context: ./Clients/TalentManagement-Angular-Material/talent-management
      dockerfile: Dockerfile
    container_name: talent-angular
    ports:
      - "4200:4200"
    volumes:
      - ./Clients/TalentManagement-Angular-Material/talent-management:/app
      - /app/node_modules
    depends_on:
      - api
      - identityserver
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
- [ ] Create `docker-compose.yml` in repo root (choose Option A or B)
- [ ] Ensure `.gitattributes` has `* text=auto eol=lf` for consistent line endings
- [ ] Add optional `docker-compose.override.yml` for local customization

### 5. Configure app networking and CORS

**CRITICAL: Angular runs in the browser, not in the container.**
The browser makes requests to API and IdentityServer, so URLs must be browser-reachable.

**Angular Configuration** (`talent-management/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44378/api/v1',  // ← Keep this (browser-reachable)
  identityServerUrl: 'https://localhost:44310',  // ← Keep this (browser-reachable)
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',
  // ... other settings
};
```

**Tasks:**
- [ ] Check `talent-management/src/environments/environment.ts` - URLs should remain `https://localhost:44378` and `https://localhost:44310`
- [ ] Check `identityServerUrl` - should remain `https://localhost:44310`
- [ ] DO NOT change to Docker internal service names like `http://api:5000` - those won't work in browser

**CORS Configuration Required:**

**API CORS** (`ApiResources/TalentManagement-API/appsettings.json`):
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

**IdentityServer CORS** (`TokenService/Duende-IdentityServer/.../identityserverdata.json`):
```json
{
  "ClientId": "TalentManagement",
  "AllowedCorsOrigins": [
    "http://localhost:4200",
    "https://localhost:4200"
  ],
  "RedirectUris": ["http://localhost:4200/callback"],
  "PostLogoutRedirectUris": ["http://localhost:4200"]
}
```

**CORS Checklist:**
- [ ] API `appsettings.json` allows origin `http://localhost:4200`
- [ ] IdentityServer allows origin `http://localhost:4200` in CORS policy
- [ ] IdentityServer client config has RedirectUri `http://localhost:4200/callback`
- [ ] IdentityServer client config has PostLogoutRedirectUri `http://localhost:4200`

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
- [ ] If CORS errors: Verify API and IdentityServer CORS config allows `http://localhost:4200`
- [ ] If "Connection refused": Ensure API and IdentityServer are running (if on host) or started (if in Docker)
- [ ] Browser can directly open `https://localhost:44310` (IdentityServer) and `https://localhost:44378/swagger` (API)

**Authentication Issues:**
- [ ] If "invalid_scope": Verify `environment.ts` scope matches IdentityServer `AllowedScopes`
- [ ] If redirect loop: Check IdentityServer RedirectUris includes `http://localhost:4200/callback`
- [ ] If logout fails: Check PostLogoutRedirectUris includes `http://localhost:4200`

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
- [ ] Document dev and prod run flows separately
- [ ] Document startup order for full stack (IdentityServer → API → Angular)

## Quick Start Commands

### Option A: Angular Only in Docker

**Prerequisites:** API and IdentityServer running on host machine

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

### Option B: Full Stack in Docker

**All services in Docker:**

```powershell
# From tutorial root
cd C:\apps\AngularNetTutotial

# Build all images
docker compose build

# Start all services (order matters)
docker compose up -d identityserver
docker compose up -d api
docker compose up -d frontend

# OR start all at once (compose handles dependencies)
docker compose up -d

# Check all containers
docker compose ps

# View logs for specific service
docker compose logs -f frontend
docker compose logs -f api
docker compose logs -f identityserver

# View all logs
docker compose logs -f

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
