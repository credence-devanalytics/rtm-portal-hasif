#!/bin/bash

# Fast deployment script using pre-built images from registry
set -e

echo "🚀 Deploying from registry (no local build required)..."

# Configuration
REGISTRY="ghcr.io/credence-devanalytics/rtm-portal-hasif"
COMPOSE_FILE="docker-compose.registry.yml"

echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

echo "🔄 Restarting services..."
docker-compose -f $COMPOSE_FILE up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed!"
echo "🌐 App should be available at: http://localhost:3031"

# Show running containers
echo "📊 Running containers:"
docker-compose -f $COMPOSE_FILE ps