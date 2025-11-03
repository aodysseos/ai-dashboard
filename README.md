# AI Dashboard Monorepo

A modern dashboard application built with Turborepo, Express, React, and TanStack libraries.

## 🏗️ Architecture

This monorepo contains:

- **`apps/api`** - Express.js backend with TypeScript
- **`apps/client`** - React frontend with Vite, TanStack libraries, and shadcn/ui
- **`packages/types`** - Shared TypeScript types for cross-app type safety

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

```bash
# Install all dependencies
npm install

# Build all packages
npm run build
```

### Development

```bash
# Start both API and client in development mode
npm run dev

# Or start individually:
npm run api:dev    # Start API server on http://localhost:3001
npm run client:dev # Start client on http://localhost:5173
```

### Testing

```bash
# Run all tests
npm run test

# Run tests for specific app
npm run api:test     # Backend tests (Jest + Supertest)
npm run client:test  # Frontend tests (Vitest + React Testing Library)
```

## 🐳 Docker Setup

This project includes a complete Docker setup with multi-stage builds for both development and production environments.

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker

#### Development Mode

```bash
# 1. Create environment files
cp apps/api/.env.example apps/api/.env
cp apps/client/.env.example apps/client/.env

# 2. Update .env files with your AWS credentials

# 3. Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Development features:**
- Hot-reloading for both API and client
- Source code mounted as volumes
- Vite dev server on port 5173
- Nodemon for API auto-restart

#### Production Mode

```bash
# 1. Create environment file for Docker
cp env.docker.example .env

# 2. Update .env with production values

# 3. Build and start production services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

**Production features:**
- Optimized multi-stage builds
- Nginx serving static React build
- Non-root user for security
- Health checks for both services
- Minimal production dependencies

### Docker Services

| Service | Development Port | Production Port | Description |
|---------|-----------------|-----------------|-------------|
| API | 3001 | 3001 | Express backend |
| Client | 5173 | 80 | React frontend (Vite dev / Nginx prod) |

### Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# View running containers
docker-compose ps

# Execute command in running container
docker-compose exec api sh
docker-compose exec client sh

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f client

# Restart a service
docker-compose restart api

# Scale services (if needed)
docker-compose up -d --scale api=2
```

### Docker Architecture

**Multi-stage Builds:**
- **Base stage**: Common setup for dependencies
- **Development stage**: Full dev environment with hot-reloading
- **Builder stage**: Compiles TypeScript and builds production assets
- **Production stage**: Minimal runtime with only production dependencies

**Networking:**
- Services communicate via Docker network (`ai-dashboard-network`)
- API accessible at `http://api:3001` from within Docker network
- Ports exposed to host for external access

**Volumes (Development):**
- Source code mounted for hot-reloading
- `node_modules` as named volumes to avoid host/container conflicts

### Environment Configuration

The project uses different environment configurations for different scenarios:

1. **Local Development** (without Docker):
   - Use `apps/api/.env.example` → `apps/api/.env`
   - Use `apps/client/.env.example` → `apps/client/.env`
   - Set `API_HOST=localhost`

2. **Docker Development**:
   - Use `apps/api/.env.example` → `apps/api/.env`
   - Use `apps/client/.env.example` → `apps/client/.env`
   - Set `API_HOST=0.0.0.0` in API env

3. **Docker Production**:
   - Use `env.docker.example` → `.env` (root)
   - Update with production URLs and credentials
   - Set `NODE_ENV=production`

### Troubleshooting

**Port already in use:**
```bash
# Check what's using the port
lsof -i :3001  # For API
lsof -i :5173  # For client dev
lsof -i :80    # For client prod

# Stop the existing container
docker-compose down
```

**Permission issues:**
```bash
# Reset volumes and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**View detailed logs:**
```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f --timestamps api
```

**Clean Docker system:**
```bash
# Remove all stopped containers, networks, and dangling images
docker system prune

# Remove all volumes (⚠️ This will delete all data)
docker system prune -a --volumes
```

## 📁 Project Structure

```
ai-dashboard/
├── apps/
│   ├── api/                 # Express backend
│   │   ├── src/
│   │   │   ├── domains/     # Future domain logic
│   │   │   ├── common/      # Shared utilities
│   │   │   └── __tests__/   # Integration tests
│   │   └── package.json
│   └── client/              # React frontend
│       ├── src/
│       │   ├── routes/      # TanStack Router routes
│       │   ├── dashboard/   # Dashboard components
│       │   │   └── components/ui/  # shadcn/ui components (isolated)
│       │   ├── common/      # Shared components & hooks
│       │   └── __tests__/   # Component tests
│       └── package.json
├── packages/
│   └── types/               # Shared types
│       ├── src/
│       │   ├── api/         # API-specific types
│       │   ├── client/      # Client-specific types
│       │   └── core/        # Core/common types
│       └── package.json
├── turbo.json               # Turborepo configuration
└── package.json             # Workspace root
```

## 🛠️ Tech Stack

### Backend (`apps/api`)
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Jest + Supertest** - Testing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend (`apps/client`)
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TanStack Query** - Data fetching and state management
- **TanStack Router** - Type-safe routing
- **TanStack Table** - Headless table/data grid
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS
- **Vitest + React Testing Library** - Testing

### Shared
- **TypeScript** - Type safety across all packages
- **Turborepo** - Monorepo build system
- **npm workspaces** - Package management

## 🎨 UI Components

The dashboard includes a comprehensive set of shadcn/ui components:

- **Layout**: Button, Card, Badge
- **Data Display**: Table, Avatar
- **Forms**: Input, Select
- **Navigation**: (Ready for expansion)

All components are isolated in `apps/client/src/dashboard/components/ui/` for decoupled usage.

## 🔧 Configuration

### Environment Variables

Copy the example files and configure as needed:

```bash
# API environment
cp apps/api/.env.example apps/api/.env

# Client environment  
cp apps/client/.env.example apps/client/.env
```

### TypeScript Path Aliases

- `@workspace/types` - Access shared types
- `@/*` - Access client source files

## 📊 Features Demonstrated

- ✅ Monorepo setup with Turborepo
- ✅ Express API with health checks
- ✅ React app with TanStack Query integration
- ✅ TanStack Table with sorting, filtering, pagination
- ✅ shadcn/ui components with Tailwind CSS
- ✅ Type-safe API integration
- ✅ Comprehensive testing setup
- ✅ Domain-driven folder structure (ready for expansion)

## 🚧 Next Steps

This is a foundation setup. You can now:

1. Add your business domains to `apps/api/src/domains/`
2. Create new routes in `apps/client/src/routes/`
3. Add more shadcn/ui components as needed
4. Implement authentication/authorization
5. Add database integration
6. Set up CI/CD pipelines

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all packages |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run clean` | Clean all build artifacts |

## 🤝 Contributing

1. Follow the domain-driven design principles
2. Keep types in the shared `packages/types` package
3. Write tests for new features
4. Use the established folder structure

---

Built with ❤️ using modern web technologies.
