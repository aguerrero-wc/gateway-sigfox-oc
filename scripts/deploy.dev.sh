#!/bin/bash
set -e

echo "🚀 Deploying Development Environment..."

# Verificar que existe .env
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Cargar variables
export $(grep -v '^#' .env | xargs)

# Build y deploy
docker compose --profile dev down
docker compose --profile dev build
docker compose --profile dev up -d

echo "✅ Development environment ready!"
echo "📊 App: http://localhost:${APP_PORT}"
echo "🗄️  DB: localhost:${DB_PORT}"