import type {
  NewUserRecord,
  UserDisplayName,
  UserRecord,
} from "../dto.js";

export interface UserRepository {
  findById(userId: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findDisplayNames(userIds: readonly string[]): Promise<readonly UserDisplayName[]>;
  create(user: NewUserRecord): Promise<UserRecord>;
}
