#!/bin/bash
set -e
echo "🚀 [DEV] Starting Bridge IoT Pipeline..."

# 1. Validar Red
if ! docker network inspect sigfox_network >/dev/null 2>&1; then
    echo "🌐 Creating internal bridge network..."
    docker network create --subnet=172.20.0.0/16 sigfox_network
fi

# 2. Validar .env
[ ! -f .env ] && { echo "❌ Missing .env"; exit 1; }

# 3. Deploy
docker compose --profile dev up -d --build

echo "✅ Dev Environment is UP"