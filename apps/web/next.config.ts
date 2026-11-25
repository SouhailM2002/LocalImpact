import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));
loadEnvConfig(workspaceRoot, process.env.NODE_ENV === "development");

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  transpilePackages: [
    "@localimpact/application",
    "@localimpact/db",
    "@localimpact/domain",
    "@localimpact/infra",
    "@localimpact/ui",
  ],
};

export default nextConfig;
