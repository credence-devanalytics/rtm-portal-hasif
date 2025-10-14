#!/bin/bash

# Fast Docker build script for production deployment
set -e

echo "🚀 Starting fast Docker build for production..."

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with parallel execution and maximum cache usage
echo "📦 Building with Docker BuildKit and parallel execution..."
docker-compose -f docker-compose.prod.yml build --parallel --pull

echo "✅ Build completed successfully!"

# Show image sizes
echo "📊 Image sizes:"
docker images | grep rtm-portal

echo "🎉 Ready for deployment! Use: docker-compose -f docker-compose.prod.yml up -d"