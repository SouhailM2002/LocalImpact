export type InMemoryRepositoryErrorCode =
  | "RECORD_ALREADY_EXISTS"
  | "RECORD_NOT_FOUND"
  | "USER_EMAIL_ALREADY_EXISTS";

export class InMemoryRepositoryError extends Error {
  constructor(
    readonly code: InMemoryRepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
