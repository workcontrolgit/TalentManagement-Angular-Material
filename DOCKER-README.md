# Docker Setup with NGINX

This project uses **NGINX in both development and production** for environment consistency.

## Architecture

### Development Setup (Multi-Container)
```
Browser → http://localhost:4200 → NGINX Container (port 4200)
                                        ↓
                                   Dev Server Container (port 4201)
```
- **Two separate containers:** NGINX and Angular dev server
- NGINX acts as reverse proxy
- Angular dev server provides HMR and live reload
- Same URL as before: `http://localhost:4200`

### Production Setup
```
Browser → http://localhost → NGINX (port 80) → Static Files
```
- Multi-stage build with optimized bundle
- NGINX serves pre-built static files
- Production optimizations enabled

---

## Development Usage

### Start Development Environment

```bash
docker-compose up --build
```

**Access:** `http://localhost:4200`

**Features:**
- ✅ Hot Module Replacement (HMR)
- ✅ Live reload on file changes
- ✅ NGINX reverse proxy (environment consistency)
- ✅ WebSocket support for HMR
- ✅ Volume mounts for instant updates

### Stop Development Environment

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f frontend
```

---

## Production Usage

### Build and Run Production Environment

```bash
docker-compose -f docker-compose.prod.yml up --build
```

**Access:** `http://localhost`

**Features:**
- ✅ Optimized production build
- ✅ Gzip compression
- ✅ Static asset caching (1 year)
- ✅ Security headers
- ✅ SPA routing support
- ✅ Health check endpoint

### Stop Production Environment

```bash
docker-compose -f docker-compose.prod.yml down
```

### Production Build Only (No Run)

```bash
docker build -f talent-management/Dockerfile.prod -t talent-management:prod ./talent-management
```

---

## File Structure

```
talent-management/
├── Dockerfile                 # Angular dev server only
├── Dockerfile.nginx          # NGINX container for development
├── Dockerfile.prod           # Production multi-stage build
├── nginx.dev.conf            # NGINX config for development (proxy)
├── nginx.prod.conf           # NGINX config for production (static)
├── docker-compose.yml        # Development compose (2 services)
└── docker-compose.prod.yml   # Production compose
```

---

## Configuration Details

### Development (Two Containers)

**dev-server (Dockerfile):**
- **Base Image:** node:20-alpine
- **Port:** 4201 (internal only)
- **Features:** Angular dev server with HMR

**nginx (Dockerfile.nginx):**
- **Base Image:** nginx:alpine
- **Port:** 4200 (external access)
- **Features:** Reverse proxy with WebSocket support

### Production (Dockerfile.prod)
- **Stage 1:** Build Angular app (node:20-alpine)
- **Stage 2:** Serve with NGINX (nginx:alpine)
- **Port:** 80
- **Features:** Optimized bundle, caching, compression

---

## Health Checks

Both environments include health check endpoints:

```bash
# Development
curl http://localhost:4200/health

# Production
curl http://localhost/health
```

---

## Troubleshooting

### Port Already in Use

**Development (4200):**
```bash
# Find process using port 4200
netstat -ano | findstr :4200

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Production (80):**
```bash
# Find process using port 80
netstat -ano | findstr :80

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Rebuild Containers

```bash
# Development
docker-compose down
docker-compose build --no-cache
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up
```

### View NGINX Logs

```bash
# Access container
docker exec -it talent-management-angular sh

# View NGINX logs
cat /var/log/nginx/dev-access.log
cat /var/log/nginx/dev-error.log
```

---

## Benefits of This Setup

✅ **Environment Consistency** - Same NGINX in dev and prod
✅ **Fast Development** - HMR and live reload still work
✅ **Early Issue Detection** - Catch NGINX routing issues in dev
✅ **Production Ready** - Optimized bundle with proper caching
✅ **No Workflow Changes** - Still use `http://localhost:4200` in dev

---

## Next Steps

- [ ] Add SSL/HTTPS support for production
- [ ] Configure NGINX for API reverse proxy (if needed)
- [ ] Add Docker Compose integration with API and IdentityServer
- [ ] Set up CI/CD pipeline with Docker builds
