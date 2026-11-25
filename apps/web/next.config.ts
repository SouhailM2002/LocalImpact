import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));
loadEnvConfig(workspaceRoot, process.env.NODE_ENV === "development");

const nextConfig: NextConfig = {
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
