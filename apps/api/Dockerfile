# Base stage - common for both dev and prod
FROM node:18-alpine AS base
WORKDIR /app

# Copy workspace root package files
COPY package*.json ./
COPY package-lock.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY packages/ ./packages/

# Copy API package files
COPY apps/api/package*.json ./apps/api/

# Development stage
FROM base AS development
WORKDIR /app

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy API source code
COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api

# Expose the API port
EXPOSE 3001

# Set environment to development
ENV NODE_ENV=development

# Start the development server with nodemon
CMD ["npm", "run", "dev"]

# Build stage - compile TypeScript
FROM base AS builder
WORKDIR /app

# Install all dependencies
RUN npm ci

# Copy API source code
COPY apps/api/ ./apps/api/

# Build the shared packages first
WORKDIR /app/packages/types
RUN npm run build

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy workspace root package files
COPY package*.json ./
COPY turbo.json ./

# Copy built packages
COPY --from=builder /app/packages/types/package*.json ./packages/types/
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/tsconfig.json ./packages/types/tsconfig.json

# Copy API package.json
COPY apps/api/package*.json ./apps/api/

# Install only production dependencies
ENV NODE_ENV=production
RUN npm ci --omit=dev --workspace=@workspace/api

# Copy built API code
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

WORKDIR /app/apps/api

# Expose the API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the production server
CMD ["npm", "start"]

