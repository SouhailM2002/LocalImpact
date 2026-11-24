# LocalImpact — Project Context

## Project Objective

Build a full-stack issue-reporting and resolution-tracking platform for a campus or residential environment.

## User Roles

- **USER**: Can register, log in, create reports, browse reports, support a report once, and comment.
- **RESPONSABLE**: Can view reports assigned to them, manage their status, and provide intervention descriptions.
- **ADMIN**: Can manage report assignments, oversee reports, and access administrative statistics.

## Mandatory Features

### Accounts and Permissions

- Provide registration and authentication for all three roles: USER, RESPONSABLE, and ADMIN.
- Enforce all role permissions on the server.

### Reports

- Users can create reports with a title, description, category, location, and optional photo.
- Users can browse, search, and filter reports by keyword, category, location, and status.
- Automatically detect potential duplicate reports during report creation. Suggest similar existing reports before allowing the user to create another report.
- Assign reports to responsables.

### Support and Discussion

- A user can support an existing report, with at most one support per user per report.
- Reports support comments and discussion.

### Status Workflow and History

- Use this status workflow, in order:
  `NOUVEAU -> PRIS_EN_CHARGE -> EN_COURS -> RESOLU`
- Only an authorized RESPONSABLE or ADMIN can change a report's status.
- Record every status transition in history with its author and timestamp.
- Resolving a report requires an intervention description.

### Dashboard

- Provide a dashboard showing counts by status and category, plus average resolution time.

## Business Rules and Validation

- A user cannot support the same report twice.
- Only an authorized RESPONSABLE or ADMIN can change report status.
- A report cannot be resolved without an intervention description.
- Every status transition creates a history record that includes the author and timestamp.
- Enforce all role permissions on the server.
- Validate all inputs on both the client and server.

## Original Feature: Automatic Duplicate Detection

During report creation, detect and suggest similar existing reports before allowing the user to create another one. This feature is part of the project requirements alongside the standard report creation flow.

## Technology Requirements

- TypeScript with strict mode enabled
- Node.js 20+
- Next.js App Router
- React
- Tailwind CSS
- pnpm Workspaces
- Turborepo
- PostgreSQL
- Prisma
- Zod
- Vitest
- Testcontainers
- Playwright
- dependency-cruiser
- GitHub Actions

## Architecture

Use Clean Architecture with the following packages:

- `@localimpact/domain`
- `@localimpact/application`
- `@localimpact/infra`
- `@localimpact/db`
- `@localimpact/ui`
- `@localimpact/config`

### Dependency Boundaries and Responsibilities

- **Domain** must not depend on Application, Infrastructure, Prisma, Next.js, or React.
- **Application** defines use cases and interfaces.
- **Infrastructure** implements interfaces.
- The **Next.js application** is responsible for presentation and composition.

## Project Constraints

- Preserve all requirements in this document when planning or implementing the project.
- This document records project requirements only; it does not generate the application or source code.