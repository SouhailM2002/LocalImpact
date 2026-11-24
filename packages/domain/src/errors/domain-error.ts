export type DomainErrorCode =
  | "DOMAIN_VALIDATION"
  | "INVALID_SIGNALEMENT"
  | "INVALID_STATUS_TRANSITION"
  | "DESCRIPTION_INTERVENTION_REQUISE"
  | "DEJA_SOUTENU"
  | "SIGNALEMENT_NOT_FOUND"
  | "UNAUTHORIZED_DOMAIN_OPERATION";

export abstract class DomainError extends Error {
  protected constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class DomainValidationError extends DomainError {
  constructor(readonly field: string, message: string) {
    super("DOMAIN_VALIDATION", message);
  }
}

export class InvalidSignalementError extends DomainError {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super("INVALID_SIGNALEMENT", message);
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(
    readonly fromStatus: string,
    readonly toStatus: string,
  ) {
    super(
      "INVALID_STATUS_TRANSITION",
      `The status transition from ${fromStatus} to ${toStatus} is not allowed.`,
    );
  }
}

export class DescriptionInterventionRequiseError extends DomainError {
  constructor() {
    super(
      "DESCRIPTION_INTERVENTION_REQUISE",
      "An intervention description is required to resolve a report.",
    );
  }
}

export class DejaSoutenuError extends DomainError {
  constructor(readonly userId: string) {
    super("DEJA_SOUTENU", "A user can support a report only once.");
  }
}

export class SignalementNotFoundError extends DomainError {
  constructor(readonly signalementId: string) {
    super("SIGNALEMENT_NOT_FOUND", `Report ${signalementId} was not found.`);
  }
}

export class UnauthorizedDomainOperationError extends DomainError {
  constructor(
    readonly operation: string,
    readonly actorRole: string,
  ) {
    super(
      "UNAUTHORIZED_DOMAIN_OPERATION",
      `${actorRole} is not authorized to perform ${operation}.`,
    );
  }
}

export {
  DejaSoutenuError as DuplicateSupportError,
  DescriptionInterventionRequiseError as InterventionRequiredError,
};
