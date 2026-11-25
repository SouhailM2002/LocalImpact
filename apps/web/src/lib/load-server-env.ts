import "server-only";

import { loadEnvConfig } from "@next/env";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

function findWorkspaceRoot(startDirectory: string): string | null {
  let directory = resolve(startDirectory);

  while (true) {
    if (existsSync(resolve(directory, "packages/db/prisma/schema.prisma"))) {
      return directory;
    }

    const parentDirectory = dirname(directory);
    if (parentDirectory === directory) {
      return null;
    }
    directory = parentDirectory;
  }
}

const workspaceRoot = findWorkspaceRoot(process.cwd());
if (workspaceRoot !== null) {
  loadEnvConfig(workspaceRoot, process.env.NODE_ENV === "development");
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Configure it in the workspace root .env file or the server environment.",
  );
}
