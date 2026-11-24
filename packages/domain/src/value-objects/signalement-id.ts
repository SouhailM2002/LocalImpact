import { requireNonBlank } from "../validation.js";

export class SignalementId {
  private constructor(readonly value: string) {}

  static create(value: string): SignalementId {
    return new SignalementId(requireNonBlank(value, "id", "signalement"));
  }

  equals(other: SignalementId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
