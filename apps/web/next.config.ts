import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import { resolve } from "node:path";

loadEnvConfig(resolve(process.cwd(), "../.."), process.env.NODE_ENV === "development");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@localimpact/application",
    "@localimpact/db",
    "@localimpact/domain",
    "@localimpact/infra",
    "@localimpact/ui",
  ],
};

export default nextConfig;
