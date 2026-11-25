# LocalImpact

LocalImpact is a full-stack issue-reporting and resolution-tracking platform for campus and residential environments. Its requirements, roles, business rules, and architecture are documented in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

## Project Status

The pnpm/Turborepo workspace, responsive Next.js shell, server-side authentication integration, report creation, and report exploration are in place. Report creation checks for textually similar reports in the same category and location and asks the user to confirm before proceeding. The admin dashboard provides report statistics and report assignment; Responsable status management and remaining support/comment actions are still to be implemented.

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
- `pnpm test` — run workspace tests

Run lint for one workspace with `pnpm --filter @localimpact/domain lint`, replacing the package name with `@localimpact/application`, `@localimpact/infra`, `@localimpact/db`, `@localimpact/ui`, `@localimpact/config`, or `@localimpact/web`. The shared ESLint rules live in `packages/config/eslint.config.mjs`; the root `eslint.config.mjs` exposes them to every workspace.
