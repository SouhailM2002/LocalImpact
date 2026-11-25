import "server-only";

import { headers } from "next/headers";
import type { UserRole } from "@localimpact/application";

import { auth } from "./auth";

export interface AuthenticatedUser {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly role: UserRole;
}

function isUserRole(role: unknown): role is UserRole {
  return role === "USER" || role === "RESPONSABLE" || role === "ADMIN";
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session === null) {
    return null;
  }

  if (!isUserRole(session.user.role)) {
    throw new Error("The authenticated account has an unsupported role.");
  }

  return {
    id: session.user.id,
    displayName: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}
