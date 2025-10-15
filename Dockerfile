# Use the official Node.js 20 Alpine image for better performance
FROM node:20-alpine AS base

# Install pnpm globally once for better caching
FROM base AS pnpm-base
RUN npm install -g pnpm --location=global

# Install dependencies only when needed
FROM pnpm-base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copy package.json and pnpm-lock.yaml first for better Docker layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile, prefer offline, and ignore build scripts for faster installs
RUN pnpm install --frozen-lockfile --ignore-scripts --prefer-offline

# Set environment variables for build
ENV DATABASE_URL=postgresql://root:%23M3dinaCredence%2125@postgres:5432/rtmmedina

# Copy the rest of the application code (excluding node_modules via .dockerignore)
COPY . .

# Build the application with optimized settings
ARG NEXT_TELEMETRY_DISABLED=1
ARG NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED}
ENV NODE_OPTIONS=${NODE_OPTIONS}
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for health checks and create a non-root user with proper permissions
RUN apk add --no-cache curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && \
    chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3031

ENV PORT=3031
ENV HOSTNAME="0.0.0.0"

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3031/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))" || \
  curl -f http://localhost:3031/api/health || exit 1

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
