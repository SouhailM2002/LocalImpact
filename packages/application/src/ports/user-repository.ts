import type {
  NewUserRecord,
  AdminUserSummaryDto,
  UserDisplayName,
  UserRecord,
  UserRole,
} from "../dto.js";

export type ChangeUserRoleResult =
  | { readonly kind: "updated"; readonly user: UserRecord }
  | { readonly kind: "not_found" }
  | { readonly kind: "last_admin" };

export interface UserRepository {
  findById(userId: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findDisplayNames(userIds: readonly string[]): Promise<readonly UserDisplayName[]>;
  findDisplayNamesByRole(role: UserRole): Promise<readonly UserDisplayName[]>;
  findAllForAdmin(): Promise<readonly AdminUserSummaryDto[]>;
  /** Atomically changes a role and refuses to demote the last administrator. */
  changeRole(userId: string, role: UserRole): Promise<ChangeUserRoleResult>;
  create(user: NewUserRecord): Promise<UserRecord>;
}
