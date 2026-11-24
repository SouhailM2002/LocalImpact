import {
  DomainValidationError,
  DescriptionInterventionRequiseError,
  InvalidSignalementError,
} from "../errors/domain-error.js";
import { Statut } from "../value-objects/statut.js";
import { SignalementId } from "../value-objects/signalement-id.js";
import { copyValidDate, requireNonBlank } from "../validation.js";

export interface CreateHistoriqueStatutInput {
  readonly id: string;
  readonly signalementId: SignalementId;
  readonly previousStatus: Statut;
  readonly newStatus: Statut;
  readonly authorId: string;
  readonly changedAt?: Date;
  readonly interventionDescription?: string;
}

export class HistoriqueStatut {
  private constructor(
    readonly id: string,
    readonly signalementId: SignalementId,
    readonly previousStatus: Statut,
    readonly newStatus: Statut,
    readonly authorId: string,
    private readonly changeDate: Date,
    readonly interventionDescription: string | undefined,
  ) {}

  static create(input: CreateHistoriqueStatutInput): HistoriqueStatut {
    if (!(input.signalementId instanceof SignalementId)) {
      throw new InvalidSignalementError("signalementId", "A valid report ID is required.");
    }
    if (!(input.previousStatus instanceof Statut) || !(input.newStatus instanceof Statut)) {
      throw new DomainValidationError("status", "Valid previous and new statuses are required.");
    }

    input.previousStatus.assertCanTransitionTo(input.newStatus);

    if (
      input.interventionDescription !== undefined &&
      typeof input.interventionDescription !== "string"
    ) {
      throw new DomainValidationError(
        "interventionDescription",
        "interventionDescription must be text.",
      );
    }

    const trimmedInterventionDescription = input.interventionDescription?.trim();
    const interventionDescription =
      trimmedInterventionDescription === "" ? undefined : trimmedInterventionDescription;

    if (input.newStatus.equals(Statut.RESOLU) && interventionDescription === undefined) {
      throw new DescriptionInterventionRequiseError();
    }

    return new HistoriqueStatut(
      requireNonBlank(input.id, "id"),
      input.signalementId,
      input.previousStatus,
      input.newStatus,
      requireNonBlank(input.authorId, "authorId"),
      copyValidDate(input.changedAt ?? new Date(), "changedAt"),
      interventionDescription,
    );
  }

  get changedAt(): Date {
    return new Date(this.changeDate.getTime());
  }
}
