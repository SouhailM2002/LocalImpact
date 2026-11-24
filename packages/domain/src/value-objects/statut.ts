import { DomainValidationError } from "../errors/domain-error.js";
import { InvalidStatusTransitionError } from "../errors/domain-error.js";

export const STATUT_VALUES = [
  "NOUVEAU",
  "PRIS_EN_CHARGE",
  "EN_COURS",
  "RESOLU",
] as const;

export type StatutValue = (typeof STATUT_VALUES)[number];

const NEXT_STATUS: Readonly<Record<StatutValue, StatutValue | undefined>> = {
  NOUVEAU: "PRIS_EN_CHARGE",
  PRIS_EN_CHARGE: "EN_COURS",
  EN_COURS: "RESOLU",
  RESOLU: undefined,
};

export class Statut {
  static readonly NOUVEAU = new Statut("NOUVEAU");
  static readonly PRIS_EN_CHARGE = new Statut("PRIS_EN_CHARGE");
  static readonly EN_COURS = new Statut("EN_COURS");
  static readonly RESOLU = new Statut("RESOLU");

  private constructor(readonly value: StatutValue) {}

  static from(value: string): Statut {
    switch (value) {
      case "NOUVEAU":
        return Statut.NOUVEAU;
      case "PRIS_EN_CHARGE":
        return Statut.PRIS_EN_CHARGE;
      case "EN_COURS":
        return Statut.EN_COURS;
      case "RESOLU":
        return Statut.RESOLU;
      default:
        throw new DomainValidationError("status", `Unknown report status: ${value}.`);
    }
  }

  canTransitionTo(nextStatus: Statut): boolean {
    return NEXT_STATUS[this.value] === nextStatus.value;
  }

  assertCanTransitionTo(nextStatus: Statut): void {
    if (!this.canTransitionTo(nextStatus)) {
      throw new InvalidStatusTransitionError(this.value, nextStatus.value);
    }
  }

  equals(other: Statut): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
