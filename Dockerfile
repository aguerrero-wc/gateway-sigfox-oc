# ============================================
# STAGE 1: Base Configuration
# ============================================
FROM node:22.21.0-bookworm-slim AS base

# Metadata
LABEL maintainer="devops-team@google.com"
LABEL description="NestJS Application - NPM Build"

# Set working directory
WORKDIR /usr/src/app

# Install dumb-init for proper signal handling (Google best practice)
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Configure npm for better performance
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 100000 && \
    npm config set fetch-timeout 600000

# ============================================
# STAGE 2: Development Environment
# ============================================
FROM base AS development

# Set environment
ENV NODE_ENV=development

# Copy dependency manifests first (cache optimization)
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
# npm ci es más rápido y reproducible que npm install
RUN npm ci --loglevel=error && \
    npm cache clean --force

# Copy application source code
COPY . .

# Expose application port
EXPOSE 3000

# Development command (will be overridden by docker-compose)
CMD ["npm", "run", "start:dev"]

# ============================================
# STAGE 3: Builder (Compilation)
# ============================================
FROM base AS builder

# Set environment
ENV NODE_ENV=production

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (needed for build)
# Usando npm ci para build reproducible
RUN npm ci --loglevel=error

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies - npm prune elimina dev deps
RUN npm prune --production && \
    npm cache clean --force

# ============================================
# STAGE 4: Production Runtime
# ============================================
FROM node:22.21.0-bookworm-slim AS production

# Metadata
LABEL maintainer="devops-team@google.com"
LABEL stage="production"

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048"

# Install dumb-init only
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Copy only production artifacts from builder stage
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/package*.json ./

# Security: Switch to non-privileged user
USER node

# Health check (adjust endpoint as needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose application port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]