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
