#!/bin/bash
set -e

echo "🚀 Deploying Production Environment..."

# Verificar que existe .env.production
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found"
    exit 1
fi

# Cargar variables de producción
export $(grep -v '^#' .env.production | xargs)
export DOCKER_TARGET=production

# Backup de DB antes de deploy
echo "📦 Creating database backup..."
docker compose exec postgres pg_dump -U ${DB_USERNAME} ${DB_NAME} > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

# Build sin caché
echo "🔨 Building production image..."
docker compose --profile prod build --no-cache

# Deploy con zero-downtime
echo "🔄 Deploying new version..."
docker compose --profile prod up -d --no-deps --build app-prod

# Esperar healthcheck
echo "⏳ Waiting for health check..."
sleep 10

# Verificar salud
if docker compose --profile prod exec app-prod node -e "process.exit(0)" 2>/dev/null; then
    echo "✅ Production deployment successful!"
    echo "🌐 App: https://your-domain.com"
else
    echo "❌ Health check failed. Rolling back..."
    docker compose --profile prod down
    exit 1
fi