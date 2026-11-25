import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  NewUserRecord,
  UserDisplayName,
  UserRecord,
  UserRepository,
  UserRole,
} from "@localimpact/application";
import { UserAlreadyExistsError } from "@localimpact/application";
import { getPrismaExecutor } from "../prisma-transaction-context.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toUserRecord(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  role: UserRecord["role"];
  createdAt: Date;
}): UserRecord {
  return {
    id: user.id,
    displayName: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    createdAt: new Date(user.createdAt.getTime()),
  };
}

function isEmailUniqueConstraint(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes("email")
    : typeof target === "string" && target.includes("email");
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(userId: string): Promise<UserRecord | null> {
    const user = await getPrismaExecutor(this.prisma).user.findUnique({
      where: { id: userId },
    });

    return user === null ? null : toUserRecord(user);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await getPrismaExecutor(this.prisma).user.findUnique({
      where: { email: normalizeEmail(email) },
    });

    return user === null ? null : toUserRecord(user);
  }

  async findDisplayNames(userIds: readonly string[]): Promise<readonly UserDisplayName[]> {
    if (userIds.length === 0) {
      return [];
    }

    const users = await getPrismaExecutor(this.prisma).user.findMany({
      where: { id: { in: [...userIds] } },
      select: { id: true, name: true },
    });

    return users.map(({ id, name }) => ({ id, displayName: name }));
  }

  async findDisplayNamesByRole(role: UserRole): Promise<readonly UserDisplayName[]> {
    const users = await getPrismaExecutor(this.prisma).user.findMany({
      where: { role },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    return users.map(({ id, name }) => ({ id, displayName: name }));
  }

  async create(user: NewUserRecord): Promise<UserRecord> {
    try {
      const created = await getPrismaExecutor(this.prisma).user.create({
        data: {
          id: user.id,
          name: user.displayName,
          email: normalizeEmail(user.email),
          passwordHash: user.passwordHash,
          role: user.role,
          createdAt: user.createdAt,
        },
      });

      return toUserRecord(created);
    } catch (error) {
      if (isEmailUniqueConstraint(error)) {
        throw new UserAlreadyExistsError(normalizeEmail(user.email));
      }
      throw error;
    }
  }
}
