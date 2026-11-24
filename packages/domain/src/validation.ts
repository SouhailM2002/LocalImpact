import {
  DomainValidationError,
  InvalidSignalementError,
} from "./errors/domain-error.js";
import type { DomainError } from "./errors/domain-error.js";

export type ValidationKind = "domain" | "signalement";

function validationError(
  kind: ValidationKind,
  field: string,
  message: string,
): DomainError {
  return kind === "signalement"
    ? new InvalidSignalementError(field, message)
    : new DomainValidationError(field, message);
}

export function requireNonBlank(
  value: string,
  field: string,
  kind: ValidationKind = "domain",
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError(kind, field, `${field} must not be empty.`);
  }

  return value.trim();
}

export function optionalNonBlank(
  value: string | undefined,
  field: string,
  kind: ValidationKind = "domain",
): string | undefined {
  return value === undefined ? undefined : requireNonBlank(value, field, kind);
}

export function copyValidDate(
  value: Date,
  field: string,
  kind: ValidationKind = "domain",
): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw validationError(kind, field, `${field} must be a valid date.`);
  }

  return new Date(value.getTime());
}
