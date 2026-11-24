import { ApplicationValidationError } from "../errors/application-error.js";

export function requireNonBlank(value: string, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApplicationValidationError(field, `${field} must not be empty.`);
  }

  return value.trim();
}

export function normalizeEmail(email: string): string {
  const normalizedEmail = requireNonBlank(email, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new ApplicationValidationError("email", "A valid email address is required.");
  }

  return normalizedEmail;
}

export function assertSupportedRole(role: string): void {
  if (role !== "USER" && role !== "RESPONSABLE" && role !== "ADMIN") {
    throw new ApplicationValidationError("role", "A valid user role is required.");
  }
}
