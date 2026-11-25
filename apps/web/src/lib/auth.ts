import "server-only";

import { randomBytes } from "node:crypto";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@localimpact/db";
import { ScryptPasswordHasher } from "@localimpact/infra";

import "./load-server-env";

const productionBuild = process.env.NEXT_PHASE === "phase-production-build";
const secret = process.env.BETTER_AUTH_SECRET ?? (
  process.env.NODE_ENV !== "production" || productionBuild
    ? randomBytes(32).toString("base64url")
    : undefined
);

if (secret === undefined) {
  throw new Error("BETTER_AUTH_SECRET must be configured in production.");
}

const passwordHasher = new ScryptPasswordHasher();

export const auth = betterAuth({
  appName: "LocalImpact",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password) => passwordHasher.hash(password),
      verify: ({ hash, password }) => passwordHasher.verify(password, hash),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  plugins: [nextCookies()],
});
