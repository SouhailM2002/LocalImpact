import { describe, expect, it } from "vitest";

import {
  DejaSoutenuError,
  DescriptionInterventionRequiseError,
  DomainError,
  InvalidSignalementError,
  InvalidStatusTransitionError,
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "../src/index.js";
import type { DomainErrorCode } from "../src/index.js";

const errors: ReadonlyArray<{
  readonly error: DomainError;
  readonly name: string;
  readonly code: DomainErrorCode;
}> = [
  {
    error: new InvalidSignalementError("title", "A report title is required."),
    name: "InvalidSignalementError",
    code: "INVALID_SIGNALEMENT",
  },
  {
    error: new InvalidStatusTransitionError("NOUVEAU", "RESOLU"),
    name: "InvalidStatusTransitionError",
    code: "INVALID_STATUS_TRANSITION",
  },
  {
    error: new DescriptionInterventionRequiseError(),
    name: "DescriptionInterventionRequiseError",
    code: "DESCRIPTION_INTERVENTION_REQUISE",
  },
  {
    error: new DejaSoutenuError("user-1"),
    name: "DejaSoutenuError",
    code: "DEJA_SOUTENU",
  },
  {
    error: new SignalementNotFoundError("signalement-1"),
    name: "SignalementNotFoundError",
    code: "SIGNALEMENT_NOT_FOUND",
  },
  {
    error: new UnauthorizedDomainOperationError("change report status", "USER"),
    name: "UnauthorizedDomainOperationError",
    code: "UNAUTHORIZED_DOMAIN_OPERATION",
  },
];

describe("Domain errors", () => {
  it.each(errors)("$name extends DomainError with a stable code and message", ({
    error,
    name,
    code,
  }) => {
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe(name);
    expect(error.code).toBe(code);
    expect(error.message.trim().length).toBeGreaterThan(0);
  });
});
