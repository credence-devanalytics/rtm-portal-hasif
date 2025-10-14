# Registry Options for Fast Deployment

## 1. GitHub Container Registry (Recommended - Free)
```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Push manually
docker tag rtm-portal:latest ghcr.io/credence-devanalytics/rtm-portal-hasif:latest
docker push ghcr.io/credence-devanalytics/rtm-portal-hasif:latest
```

## 2. Docker Hub (Free tier)
```bash
# Login
docker login

# Push manually
docker tag rtm-portal:latest your-dockerhub-username/rtm-portal:latest
docker push your-dockerhub-username/rtm-portal:latest
```

## 3. DigitalOcean Container Registry (If using DO)
```bash
# Login
doctl registry login

# Push manually
docker tag rtm-portal:latest registry.digitalocean.com/your-registry/rtm-portal:latest
docker push registry.digitalocean.com/your-registry/rtm-portal:latest
```

## 4. AWS ECR (If using AWS)
```bash
# Login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

# Push manually
docker tag rtm-portal:latest your-account.dkr.ecr.us-east-1.amazonaws.com/rtm-portal:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/rtm-portal:latest
```

## Deployment Speed Comparison:

| Method | Build Time | Deploy Time | Total Time | Reliability |
|--------|------------|-------------|------------|-------------|
| Local Build | 5-15 min | 1-2 min | 6-17 min | Medium |
| Registry Pull | 0 min | 30-60 sec | 30-60 sec | High |
| CI/CD Auto | 0 min | 30-60 sec | 30-60 sec | Very High |

## Recommended Workflow:

1. **Setup GitHub Actions** (creates .github/workflows/build-and-deploy.yml)
2. **Push to prod branch** → Auto-builds and pushes to registry
3. **Deploy on VPS**: `./scripts/deploy-from-registry.sh`

This reduces your deployment time from 15+ minutes to under 1 minute!