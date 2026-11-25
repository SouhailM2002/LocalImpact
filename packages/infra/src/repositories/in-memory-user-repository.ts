import type {
  AdminUserSummaryDto,
  ChangeUserRoleResult,
  NewUserRecord,
  UserDisplayName,
  UserRepository,
  UserRecord,
  UserRole,
} from "@localimpact/application";
import { InMemoryRepositoryError } from "../errors/in-memory-repository-error.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function copyUser(user: UserRecord): UserRecord {
  return Object.freeze({
    ...user,
    createdAt: new Date(user.createdAt.getTime()),
  });
}

export class InMemoryUserRepository implements UserRepository {
  private readonly usersById = new Map<string, UserRecord>();
  private readonly idsByEmail = new Map<string, string>();

  findById(userId: string): Promise<UserRecord | null> {
    const user = this.usersById.get(userId);
    return Promise.resolve(user === undefined ? null : copyUser(user));
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    const userId = this.idsByEmail.get(normalizeEmail(email));
    if (userId === undefined) {
      return Promise.resolve(null);
    }

    const user = this.usersById.get(userId);
    return Promise.resolve(user === undefined ? null : copyUser(user));
  }

  findDisplayNames(userIds: readonly string[]): Promise<readonly UserDisplayName[]> {
    const result = userIds.flatMap((id) => {
      const user = this.usersById.get(id);
      return user === undefined
        ? []
        : [{ id: user.id, displayName: user.displayName }];
    });

    return Promise.resolve(Object.freeze(result));
  }

  findDisplayNamesByRole(role: UserRole): Promise<readonly UserDisplayName[]> {
    const result = [...this.usersById.values()]
      .filter((user) => user.role === role)
      .map(({ id, displayName }) => ({ id, displayName }))
      .sort((left, right) => (
        left.displayName.localeCompare(right.displayName) ||
        left.id.localeCompare(right.id)
      ));

    return Promise.resolve(Object.freeze(result));
  }

  findAllForAdmin(): Promise<readonly AdminUserSummaryDto[]> {
    const result = [...this.usersById.values()]
      .map(({ id, displayName, email, role }) => ({ id, displayName, email, role }))
      .sort((left, right) => (
        left.displayName.localeCompare(right.displayName) ||
        left.id.localeCompare(right.id)
      ));

    return Promise.resolve(Object.freeze(result));
  }

  changeRole(userId: string, role: UserRole): Promise<ChangeUserRoleResult> {
    const current = this.usersById.get(userId);
    if (current === undefined) {
      return Promise.resolve({ kind: "not_found" });
    }
    if (current.role === role) {
      return Promise.resolve({ kind: "updated", user: copyUser(current) });
    }
    if (
      current.role === "ADMIN" &&
      role !== "ADMIN" &&
      [...this.usersById.values()].filter((user) => user.role === "ADMIN").length <= 1
    ) {
      return Promise.resolve({ kind: "last_admin" });
    }

    const updated = copyUser({ ...current, role });
    this.usersById.set(userId, updated);
    return Promise.resolve({ kind: "updated", user: copyUser(updated) });
  }

  create(user: NewUserRecord): Promise<UserRecord> {
    const normalizedEmail = normalizeEmail(user.email);
    if (this.usersById.has(user.id)) {
      return Promise.reject(new InMemoryRepositoryError(
        "RECORD_ALREADY_EXISTS",
        `A user with ID ${user.id} already exists.`,
      ));
    }
    if (this.idsByEmail.has(normalizedEmail)) {
      return Promise.reject(new InMemoryRepositoryError(
        "USER_EMAIL_ALREADY_EXISTS",
        "A user with this email already exists.",
      ));
    }

    const storedUser = copyUser({ ...user, email: normalizedEmail });
    this.usersById.set(user.id, storedUser);
    this.idsByEmail.set(normalizedEmail, user.id);
    return Promise.resolve(copyUser(storedUser));
  }
}
