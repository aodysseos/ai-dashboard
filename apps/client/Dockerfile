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

# Copy client package files
COPY apps/client/package*.json ./apps/client/

# Development stage
FROM base AS development
WORKDIR /app

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy client source code
COPY apps/client/ ./apps/client/

WORKDIR /app/apps/client

# Expose Vite dev server port
EXPOSE 5173

# Set environment to development
ENV NODE_ENV=development

# Start the Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage - compile and build static files
FROM base AS builder
WORKDIR /app

# Install all dependencies
RUN npm ci

# Copy client source code
COPY apps/client/ ./apps/client/

# Build the shared packages first
WORKDIR /app/packages/types
RUN npm run build

# Build the client
WORKDIR /app/apps/client
RUN npm run build

# Production stage - Nginx serving static files
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Create a non-root user for nginx
RUN addgroup -g 1001 -S nginx_custom && \
    adduser -S nginx_custom -u 1001 && \
    chown -R nginx_custom:nginx_custom /usr/share/nginx/html && \
    chown -R nginx_custom:nginx_custom /var/cache/nginx && \
    chown -R nginx_custom:nginx_custom /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx_custom:nginx_custom /var/run/nginx.pid

# Use the non-root user
USER nginx_custom

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

