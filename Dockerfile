FROM node:24-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /workspace

RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN DATABASE_URL="postgresql://build:build@localhost:5432/localimpact?schema=public" \
    BETTER_AUTH_SECRET="localimpact-build-only-secret-with-more-than-32-characters" \
    BETTER_AUTH_URL="http://localhost:3000" \
    pnpm build

FROM build AS migrator
WORKDIR /workspace/packages/db
CMD ["pnpm", "exec", "prisma", "migrate", "deploy", "--config", "prisma.config.ts"]

FROM node:24-bookworm-slim AS runner
ENV NODE_ENV="production"
ENV HOSTNAME="0.0.0.0"
ENV PORT="3000"
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /workspace/apps/web/public ./apps/web/public
RUN mkdir -p ./apps/web/public/uploads && chown -R nextjs:nodejs ./apps/web/public/uploads

USER nextjs
EXPOSE 3000
WORKDIR /app/apps/web
CMD ["node", "server.js"]
