module.exports = {
  forbidden: [
    {
      name: "domain-stays-framework-independent",
      severity: "error",
      from: { path: "^packages/domain/" },
      to: {
        path: "^(apps/web/|packages/(application|infra|db|ui|config)/|node_modules/(next|react|@prisma/client)(/|$))",
      },
    },
    {
      name: "application-stays-independent-of-adapters",
      severity: "error",
      from: { path: "^packages/application/" },
      to: {
        path: "^(apps/web/|packages/(infra|db|ui|config)/|node_modules/(next|react|@prisma/client)(/|$))",
      },
    },
    {
      name: "infrastructure-does-not-depend-on-frameworks-or-database-adapters",
      severity: "error",
      from: { path: "^packages/infra/" },
      to: {
        path: "^(apps/web/|packages/(db|ui|config)/|node_modules/(next|react|@prisma/client)(/|$))",
      },
    },
    {
      name: "database-adapter-does-not-depend-on-presentation",
      severity: "error",
      from: { path: "^packages/db/" },
      to: {
        path: "^(apps/web/|packages/(ui|config)/|node_modules/(next|react)(/|$))",
      },
    },
    {
      name: "ui-does-not-depend-on-business-packages",
      severity: "error",
      from: { path: "^packages/ui/" },
      to: {
        path: "^(apps/web/|packages/(application|domain|infra|db|config)/|node_modules/(next|@prisma/client)(/|$))",
      },
    },
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: "(^|/)(node_modules|dist|\\.next|tests|e2e)/",
    tsConfig: { fileName: "apps/web/tsconfig.json" },
  },
};
