import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";
const databaseUrl =
  "postgresql://localimpact_e2e:localimpact_e2e@127.0.0.1:55432/localimpact_e2e?schema=public";
const authSecret = "localimpact-e2e-only-secret-with-more-than-32-characters";

process.env.DATABASE_URL = databaseUrl;
process.env.BETTER_AUTH_SECRET = authSecret;
process.env.BETTER_AUTH_URL = baseURL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm --filter @localimpact/web exec next dev --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_SECRET: authSecret,
      BETTER_AUTH_URL: baseURL,
      NEXT_DIST_DIR: ".next-e2e",
      PORT: "3100",
    },
  },
});
