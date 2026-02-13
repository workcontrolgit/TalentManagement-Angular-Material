# Docker Setup

This document tracks the tasks required to run the Talent Management Angular app with Docker.

## Scope
- Frontend project path: `talent-management`
- Host machine path: `C:\apps\AngularNetTutotial\Clients\TalentManagement-Angular-Material`
- Output goal: run app locally via Docker Compose

## Task Checklist

### 1. Pre-checks
- [ ] Docker Desktop is installed and running
- [ ] `docker --version` works
- [ ] `docker compose version` works
- [ ] Node/Angular local build is healthy (optional but recommended)

### 2. Inspect current repo state
- [ ] Check for existing `Dockerfile` in `talent-management`
- [ ] Check for existing `.dockerignore` in `talent-management`
- [ ] Check for existing `docker-compose.yml` in repo root
- [ ] Reuse existing files if valid; avoid duplicate compose stacks

### 3. Choose runtime mode
- [ ] Decide `Development` mode (`ng serve` in container)
- [ ] Decide `Production` mode (Angular build + Nginx serve)
- [ ] Confirm target port mapping (`4200` dev or `8080` host to `80` container)

### 4. Create Docker artifacts
- [ ] Create/update `talent-management/Dockerfile`
- [ ] Create/update `talent-management/.dockerignore`
- [ ] Create/update root `docker-compose.yml`
- [ ] Add optional `docker-compose.override.yml` for local customization

### 5. Configure app networking
- [ ] Verify API base URL for containerized run
- [ ] If backend is in Docker, point frontend to backend service name (example: `http://api:5000`)
- [ ] If needed, configure Angular proxy or Nginx reverse proxy for `/api`
- [ ] Validate CORS behavior for local Docker access

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
- [ ] Port conflict resolved (change host port if needed)
- [ ] `node_modules` cache/build issues resolved (rebuild image)
- [ ] API DNS/service-name resolution verified in compose network
- [ ] Environment file selection (`environment.ts` vs `environment.prod.ts`) confirmed

### 9. Documentation and handoff
- [ ] Add final run commands to `README.md` or docs
- [ ] Document required environment variables
- [ ] Document dev and prod run flows separately

## Suggested Commands

```powershell
# from repo root
cd C:\apps\AngularNetTutotial\Clients\TalentManagement-Angular-Material

docker compose build
docker compose up -d
docker compose ps
docker compose logs -f frontend
```

## Completion Criteria
- [ ] App is accessible in browser through Docker
- [ ] Frontend loads without runtime blocking errors
- [ ] API calls succeed in target environment
- [ ] Team can reproduce startup using documented commands

## Dev Mode URL Strategy (Keep Existing STS/API URLs)

For this project, Angular runs in a container, but the Angular code executes in the browser. Because of that, Angular should continue using the same STS and Web API URLs that already work when Angular runs outside Docker.

Rules:
- Keep existing browser-reachable URLs unchanged (for example `https://localhost:44378`), if they already work.
- Do not replace browser-facing STS/API URLs with Docker internal service names like `http://api:5000` in Angular environment files.
- Use Docker internal service names only for server-to-server communication or proxy targets inside containers.

Checklist for this behavior:
- [ ] Confirm Angular `environment` URL values match current working (non-containerized) values.
- [ ] Confirm STS redirect URIs and post-logout redirect URIs still include the Angular browser URL.
- [ ] Confirm API and STS CORS allow the Angular browser origin (example: `http://localhost:4200`).
- [ ] Confirm browser can open STS URL directly and API health endpoint directly.
- [ ] Confirm token acquisition and API calls work after Angular is moved to container.
