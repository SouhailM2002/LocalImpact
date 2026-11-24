import { describe, expect, it } from "vitest";

import {
  DomainValidationError,
  InvalidStatusTransitionError,
  InvalidSignalementError,
  SignalementId,
  Statut,
} from "../src/index.js";

describe("SignalementId", () => {
  it("trims its value and compares by value", () => {
    const first = SignalementId.create(" report-1 ");
    const second = SignalementId.create("report-1");

    expect(first.value).toBe("report-1");
    expect(first.equals(second)).toBe(true);
    expect(first.toString()).toBe("report-1");
  });

  it("rejects blank IDs", () => {
    expect(() => SignalementId.create("  ")).toThrow(InvalidSignalementError);
  });
});

describe("Statut", () => {
  it("only creates one of the defined statuses", () => {
    expect(Statut.from("NOUVEAU")).toBe(Statut.NOUVEAU);
    expect(() => Statut.from("ARCHIVE")).toThrow(DomainValidationError);
  });

  it("permits only the next status in the workflow", () => {
    expect(Statut.NOUVEAU.canTransitionTo(Statut.PRIS_EN_CHARGE)).toBe(true);
    expect(Statut.PRIS_EN_CHARGE.canTransitionTo(Statut.EN_COURS)).toBe(true);
    expect(Statut.EN_COURS.canTransitionTo(Statut.RESOLU)).toBe(true);
    expect(Statut.NOUVEAU.canTransitionTo(Statut.EN_COURS)).toBe(false);
    expect(Statut.RESOLU.canTransitionTo(Statut.NOUVEAU)).toBe(false);
    expect(() => Statut.NOUVEAU.assertCanTransitionTo(Statut.EN_COURS)).toThrow(
      InvalidStatusTransitionError,
    );
  });
});
