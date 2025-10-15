# Coolify Deployment Guide

## Image Configuration
**Registry URL**: `ghcr.io/credence-devanalytics/rtm-portal-hasif:latest`

## Coolify Setup Steps:

### 1. Create New Service in Coolify
- Go to your Coolify dashboard
- Click "Add New Service"
- Choose "Docker Image"

### 2. Image Configuration
```
Image: ghcr.io/credence-devanalytics/rtm-portal-hasif:latest
Registry: GitHub Container Registry
```

### 3. Registry Credentials
- **Registry URL**: `ghcr.io`
- **Username**: Your GitHub username
- **Password**: GitHub Personal Access Token with `read:packages` scope

### 4. Port Configuration
- **Container Port**: `3031`
- **External Port**: Choose your desired port (e.g., `3031`)

### 5. Environment Variables
Add these environment variables:
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3031
HOSTNAME=0.0.0.0
DATABASE_URL=postgresql://username:password@your-db-host:5432/database_name
```

### 6. Health Check
```
HTTP Health Check: http://localhost:3031/api/health
Interval: 30 seconds
Timeout: 10 seconds
Retries: 3
```

### 7. Auto-Deploy Settings
- Enable auto-deploy from GitHub
- Watch branch: `prod/v-1.0.0`
- Trigger on successful GitHub Actions build

## Deployment Workflow:

1. **Code Changes** → Push to `prod/v-1.0.0`
2. **GitHub Actions** → Builds and pushes to `ghcr.io/credence-devanalytics/rtm-portal-hasif:latest`
3. **Coolify** → Automatically pulls new image and redeploys

## Manual Deployment:
If auto-deploy is not set up:
1. Wait for GitHub Actions to complete
2. Go to your service in Coolify
3. Click "Redeploy" → "Pull latest image"

## Benefits:
✅ No build time on your server
✅ Instant deployments (< 2 minutes)
✅ Automatic rollbacks on failure
✅ Built-in health checks
✅ Resource monitoring