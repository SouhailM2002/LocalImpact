# LocalImpact

LocalImpact is a full-stack issue-reporting and resolution-tracking platform for campus and residential environments. Its requirements, roles, business rules, and architecture are documented in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

## Project Status

The pnpm/Turborepo workspace, responsive Next.js shell, server-side authentication integration, report creation, report exploration, and role-specific Admin and Responsable workflows are in place. Report creation checks for textually similar reports in the same category and location and asks the user to confirm before proceeding. Admins can view report statistics, assign Responsables, and advance report statuses; Responsables can update assigned reports through the required status workflow. Community members can support a report once and submit comments. A report's creator receives a persistent in-app notification when it receives support.

## Technology

- Node.js 20.19+, 22.13+, or 24+ (required by the ESLint 10 toolchain)
- TypeScript 6.0 with strict mode
- ESLint 10 with type-aware TypeScript, React, React Hooks, and Next.js rules
- Next.js App Router and React
- Tailwind CSS
- pnpm Workspaces and Turborepo
- PostgreSQL and Prisma
- Zod, Vitest, Testcontainers, and Playwright
- dependency-cruiser and GitHub Actions

## Workspace Layout

pnpm recognizes `apps/*` and `packages/*` as workspace locations. The Next.js application belongs in `apps/web`; shared packages live in `packages/`.
Dependencies between internal workspaces should use the `workspace:*` protocol.

The package boundaries are:

- `@localimpact/domain`
- `@localimpact/application`
- `@localimpact/infra`
- `@localimpact/db`
- `@localimpact/ui`
- `@localimpact/config`

The Domain package must remain independent of Application, Infrastructure, Prisma, Next.js, and React. Application defines use cases and interfaces; Infrastructure and DB implement application-facing infrastructure; the Next.js application owns presentation and composition. UI contains reusable React components, and Config contains shared configuration.

Shared strict TypeScript settings are maintained in [packages/config/tsconfig.base.json](./packages/config/tsconfig.base.json). Workspace TypeScript configurations extend that base; the web application overrides module resolution and JSX settings for Next.js.

Type-aware linting currently uses `typescript-eslint` 8, whose supported TypeScript range excludes TypeScript 7. The root compiler is therefore pinned to TypeScript 6.0.x until `typescript-eslint` adds support for TypeScript 7.

## Root Commands

Run these commands from the repository root with pnpm:

- `pnpm dev` — start workspace development tasks
- `pnpm build` — build workspaces in dependency order
- `pnpm lint` — lint workspaces
- `pnpm lint:eslint` — lint all repository files directly with ESLint
- `pnpm typecheck` — type-check workspaces
- `pnpm test` — run workspace tests, including the PostgreSQL integration test
- `pnpm test:e2e` — build the web app, start an isolated test database, and run Playwright
- `pnpm dependency:check` — enforce package dependency boundaries and detect cycles
- `pnpm db:migrate:deploy` — apply committed Prisma migrations to `DATABASE_URL`
- `pnpm db:migrate:status` — show migration status for `DATABASE_URL`

Run lint for one workspace with `pnpm --filter @localimpact/domain lint`, replacing the package name with `@localimpact/application`, `@localimpact/infra`, `@localimpact/db`, `@localimpact/ui`, `@localimpact/config`, or `@localimpact/web`. The shared ESLint rules live in `packages/config/eslint.config.mjs`; the root `eslint.config.mjs` exposes them to every workspace.

## Local Development

Requirements: Node.js `20.19+`, `22.13+`, or `24+`; pnpm `10`; and Docker with Compose. The database integration and browser tests also require Docker.

1. Enable Corepack, install dependencies, and create the local environment file:

   ```powershell
   corepack enable
   pnpm install --frozen-lockfile
   Copy-Item .env.example .env
   ```

2. Start PostgreSQL, apply migrations, and run the workspace:

   ```powershell
   docker compose up -d postgres
   pnpm db:migrate:deploy
   pnpm dev
   ```

   Open `http://localhost:3000`. Update `.env` if the local database password or port differs; the `DATABASE_URL` credentials must match the Compose service.

There are no committed demo accounts or default production credentials. Register an account through the app. For local development only, an initial administrator can be bootstrapped after registration by running the following statement against the local database with the registered email:

```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'admin@example.test';
```

Do not use this manual bootstrap as an exposed production mechanism.

## Tests and CI

- `pnpm test` runs workspace tests. The database integration test starts a disposable PostgreSQL 16 Testcontainer, applies the migrations, then verifies persisted report metadata and filters.
- `pnpm test:e2e` builds the web app and runs a Playwright flow against a separate PostgreSQL database managed by `docker-compose.e2e.yml` on port `55432`. It exercises registration, accessible report creation, commenting, and pagination. The test setup removes its Compose containers and volumes afterward.
- Install the browser locally with `pnpm --filter @localimpact/web exec playwright install chromium` before the first E2E run. GitHub Actions installs Chromium and its Linux dependencies automatically.
- `pnpm dependency:check` checks the documented workspace dependency direction and rejects circular dependencies.

The GitHub Actions workflow runs boundary checks, lint, type-check, build, unit/integration tests, and the Playwright flow for pull requests and pushes to `main`.

## Docker Compose Deployment

The existing `docker-compose.yml` remains the local PostgreSQL-only development service. The production-oriented stack is separate:

1. Copy `deploy.env.example` to `.env.production`. Set unique database credentials, use a randomly generated `BETTER_AUTH_SECRET` of at least 32 characters, and set `BETTER_AUTH_URL` to the public HTTPS URL. URL-encode special characters in the database password used by `DATABASE_URL`.
2. Build and start the application:

   ```powershell
   docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
   ```

3. Check service health and logs:

   ```powershell
   docker compose --env-file .env.production -f docker-compose.prod.yml ps
   docker compose --env-file .env.production -f docker-compose.prod.yml logs -f web
   ```

The stack runs PostgreSQL, applies migrations before starting the web service, and persists database data and uploaded files in named volumes. Put a TLS-terminating reverse proxy in front of the web service before exposing it publicly; Compose does not configure TLS, backups, email delivery, or external object storage. Protect `.env.production` and back up both persistent volumes according to your operational requirements.
