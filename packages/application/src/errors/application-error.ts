import type { DuplicateSignalementSuggestion } from "../ports/duplicate-signalement-detector.js";

export type ApplicationErrorCode =
  | "APPLICATION_VALIDATION"
  | "POTENTIAL_DUPLICATES"
  | "USER_ALREADY_EXISTS"
  | "USER_NOT_FOUND"
  | "INVALID_CREDENTIALS";

export abstract class ApplicationError extends Error {
  protected constructor(
    readonly code: ApplicationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ApplicationValidationError extends ApplicationError {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super("APPLICATION_VALIDATION", message);
  }
}

export class PotentialDuplicateSignalementsError extends ApplicationError {
  constructor(readonly suggestions: readonly DuplicateSignalementSuggestion[]) {
    super(
      "POTENTIAL_DUPLICATES",
      "Des signalements similaires existent. Consultez-les avant de confirmer la création.",
    );
  }
}

export class UserAlreadyExistsError extends ApplicationError {
  constructor(readonly email: string) {
    super("USER_ALREADY_EXISTS", "An account with this email already exists.");
  }
}

export class UserNotFoundError extends ApplicationError {
  constructor(readonly userId: string) {
    super("USER_NOT_FOUND", `User ${userId} was not found.`);
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super("INVALID_CREDENTIALS", "The email or password is incorrect.");
  }
}
