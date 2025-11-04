# Development Setup

This document explains the linting, formatting, and commit conventions for this project.

## Installation

After cloning the repository, install dependencies:

```bash
npm install
```

This will install all dependencies and set up Husky git hooks automatically.

## Code Quality Tools

### ESLint

ESLint is configured for both frontend and backend with TypeScript support.

**Run linting:**
```bash
npm run lint
```

**Fix linting issues automatically:**
```bash
# Backend
cd apps/api && npm run lint:fix

# Frontend
cd apps/client && npm run lint:fix
```

**Configuration:**
- Backend: `apps/api/.eslintrc.cjs`
- Frontend: `apps/client/.eslintrc.cjs`

### Prettier

Prettier is configured at the root level for consistent code formatting.

**Format all files:**
```bash
npm run format
```

**Check formatting without fixing:**
```bash
npm run format:check
```

**Configuration:** `.prettierrc`

### EditorConfig

EditorConfig ensures consistent editor settings across the team.

**Configuration:** `.editorconfig`

Install the EditorConfig plugin for your editor to automatically apply these settings.

## Git Hooks

Husky is configured to run checks before commits:

### Pre-commit Hook
- Runs Prettier format check
- Runs ESLint on all workspaces

If either check fails, the commit will be blocked.

### Commit Message Hook
- Validates commit messages follow Conventional Commits format

## Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependencies
- `ci`: CI/CD changes
- `chore`: Other changes (maintenance)
- `revert`: Revert a previous commit

### Examples

```bash
# Good commits
feat(upload): add multipart upload support
fix(api): resolve CORS issue on upload endpoint
docs: update API documentation
refactor(client): reorganize component structure
test(upload): add tests for S3 service

# Bad commits (will be rejected)
Add feature
fixed bug
WIP
Update code
```

### Scope (optional but recommended)

- `upload`: Upload-related changes
- `api`: Backend API changes
- `client`: Frontend changes
- `types`: Shared types changes

## VS Code Integration

Recommended extensions will be suggested when you open the project:
- ESLint
- Prettier
- EditorConfig

The workspace is configured to:
- Format on save using Prettier
- Fix ESLint issues on save
- Use 2 spaces for indentation
- Use LF line endings

## Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip commit message validation
git commit --no-verify
```

⚠️ **Warning:** Only use this in emergencies. All code should pass linting and follow commit conventions.

## Troubleshooting

### Husky hooks not running

If git hooks aren't running, reinstall Husky:

```bash
npm run prepare
```

### ESLint or Prettier errors

Clear node_modules and reinstall:

```bash
npm run clean
rm -rf node_modules
npm install
```

### Commit message validation fails

Ensure your commit message follows the format:

```
type(scope): subject
```

The subject should:
- Not start with uppercase (except for acronyms)
- Not end with a period
- Be in imperative mood ("add" not "added")

