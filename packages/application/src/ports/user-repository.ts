import type { NewUserRecord, UserRecord } from "../dto.js";

export interface UserRepository {
  findById(userId: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(user: NewUserRecord): Promise<UserRecord>;
}
