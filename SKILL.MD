---
name: docker-deploy
description: >
  Deploy, restart, rebuild, or recover Docker services for the NestJS/Sigfox gateway project.
  Use when the user asks to deploy changes, restart the app, rebuild containers, or fix a broken service.
  Default profile is `dev` unless explicitly told otherwise.
---

# Docker Deploy Skill

## Context

- **Project**: NestJS gateway (sigfox-nest-bridge)
- **Default profile**: `dev`
- **Compose file**: `docker-compose.yml` in project root
- **Services**: `app-dev` (or `app-prod`), `postgres`
- **Hot-reload**: Active in `dev` profile — `src/` changes apply automatically without restart

---

## Step 0 — Orient Before Acting

Before any operation, run:

```bash
docker compose --profile dev ps
```

Identify:
- Which services are running (`Up`, `Exited`, `Restarting`)
- How long they've been up (recent crash = investigate logs first)
- Whether postgres is healthy

If a service is in a crash loop, **read logs before doing anything else**:

```bash
docker compose --profile dev logs app-dev --tail=50
```

---

## Step 1 — Detect What Changed

Inspect the change to decide the operation tier. Ask yourself (or the user) what files were modified:

| Changed Files | Tier | Action |
|---|---|---|
| Only `src/**/*.ts` | 0 — Hot reload | No action needed, NestJS restarts automatically |
| `package.json` or `package-lock.json` | 1 — Rebuild | `docker compose build` + restart |
| `Dockerfile` | 1 — Rebuild | `docker compose build --no-cache` + restart |
| `docker-compose.yml` | 2 — Recreate | `down` + `up` (compose picks up config changes) |
| `.env` or environment variables | 2 — Recreate | `down` + `up` (env vars are injected at container start) |
| `nginx/` configs | 3 — Nginx only | Restart nginx service only |
| Database migrations only | 4 — App restart | Restart app service only |
| Multiple of the above | Use highest tier that applies | |

---

## Step 2 — Execute the Right Operation

### Tier 0 — Hot Reload (no action)

```bash
# Verify hot-reload is working:
docker compose --profile dev logs app-dev --tail=20 --follow
# Look for: "Nest application successfully started" or file change detection
```

If hot-reload isn't triggering, fall through to Tier 4.

---

### Tier 1 — Rebuild + Restart

Use when: `package.json`, `package-lock.json`, or `Dockerfile` changed.

```bash
# Build with cache (fast, for package changes)
docker compose --profile dev build app-dev

# OR build without cache (mandatory when Dockerfile itself changed)
docker compose --profile dev build --no-cache app-dev

# Restart the service with the new image
docker compose --profile dev up -d app-dev
```

> ⚠️ Never rebuild postgres — it has no code changes, only data.

---

### Tier 2 — Full Recreate

Use when: `docker-compose.yml` or `.env` changed.

```bash
# Bring down only app (preserve postgres data)
docker compose --profile dev stop app-dev

# Bring back up — compose applies new config
docker compose --profile dev up -d app-dev
```

If the compose change affects networks or volumes, do a full cycle:

```bash
docker compose --profile dev down --remove-orphans
docker compose --profile dev up -d
```

> ⚠️ Never use `down -v` unless explicitly told to wipe data. This destroys the postgres volume.

---

### Tier 3 — Nginx Only (prod profile)

```bash
# Test config first
docker compose --profile prod exec nginx nginx -t

# If valid, reload without downtime
docker compose --profile prod exec nginx nginx -s reload
```

---

### Tier 4 — App Restart Only

Use when: migrations ran, config tweaks, or hot-reload stopped working.

```bash
docker compose --profile dev restart app-dev
```

---

## Step 3 — Verify the Deploy

After any operation, verify in this order:

### 1. Container is running
```bash
docker compose --profile dev ps
# Expected: app-dev → Up (not Restarting, not Exited)
```

### 2. App started correctly
```bash
docker compose --profile dev logs app-dev --tail=30
# Look for: "Nest application successfully started on port 3000"
# Red flags: "Error", "ECONNREFUSED", "Cannot find module"
```

### 3. Health check passes
```bash
# Wait up to 40s (start_period in Dockerfile)
docker compose --profile dev exec app-dev \
  node -e "require('http').get('http://localhost:3000/health', r => console.log('Status:', r.statusCode))"
# Expected: Status: 200
```

### 4. Postgres is healthy
```bash
docker compose ps postgres
# Expected: postgres → Up (healthy)
```

**Deploy is successful when**: container is `Up`, logs show successful start, health returns 200.

---

## Step 4 — Rollback If Something Broke

If verification fails after a Tier 1 rebuild:

```bash
# The previous image is still tagged — restart from it
docker compose --profile dev stop app-dev
docker compose --profile dev up -d app-dev
# (compose will use cached image if build wasn't pushed)
```

If logs show app crash on startup (not build error):

```bash
# Check full error
docker compose --profile dev logs app-dev --tail=100

# Common causes:
# - DB_PASSWORD not set → check .env file
# - Missing JWT_SECRET → check .env file  
# - Postgres not ready → wait and retry, or check postgres logs
docker compose logs postgres --tail=20
```

If postgres won't connect:

```bash
# Check if postgres is actually healthy
docker compose exec postgres pg_isready -U postgres
# Then restart app after postgres is ready
docker compose --profile dev restart app-dev
```

---

## Common Commands Reference

```bash
# Status overview
docker compose --profile dev ps

# Live logs (follow)
docker compose --profile dev logs app-dev -f

# Full restart cycle (safe — preserves data)
docker compose --profile dev down --remove-orphans && docker compose --profile dev up -d

# Rebuild everything from scratch (slow — use only when caches are corrupt)
docker compose --profile dev build --no-cache && docker compose --profile dev up -d

# Enter running container
docker compose --profile dev exec app-dev sh

# Check resource usage
docker stats
```

---

## Rules the Agent Must Never Break

1. **Never run `down -v`** without explicit user confirmation — it wipes postgres data permanently.
2. **Never rebuild postgres** — it's a stateful service with no custom image.
3. **Always verify after deploy** — don't assume success from a clean build output.
4. **Always read logs before force-restarting** a crash-looping container.
5. **Hot-reload handles `src/` changes** — don't restart the container for TypeScript edits alone.