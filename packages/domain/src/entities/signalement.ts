import {
  DejaSoutenuError,
  InvalidSignalementError,
  UnauthorizedDomainOperationError,
} from "../errors/domain-error.js";
import { HistoriqueStatut } from "./historique-statut.js";
import type { CreateHistoriqueStatutInput } from "./historique-statut.js";
import { Statut } from "../value-objects/statut.js";
import { SignalementId } from "../value-objects/signalement-id.js";
import { copyValidDate, optionalNonBlank, requireNonBlank } from "../validation.js";

export interface CreateSignalementInput {
  readonly id: SignalementId;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly location: string;
  readonly photoUrl?: string;
  readonly createdAt?: Date;
  readonly creatorId: string;
  readonly assignedResponsableId?: string;
}

export interface ChangeSignalementStatusInput {
  readonly historyId: string;
  readonly newStatus: Statut;
  readonly authorId: string;
  readonly authorRole: SignalementActorRole;
  readonly changedAt?: Date;
  readonly interventionDescription?: string;
}

export type SignalementActorRole = "USER" | "RESPONSABLE" | "ADMIN";

export class Signalement {
  private currentStatus = Statut.NOUVEAU;
  private assignedResponsable: string | undefined;
  private readonly supportingUserIds = new Set<string>();

  private constructor(
    readonly id: SignalementId,
    readonly title: string,
    readonly description: string,
    readonly category: string,
    readonly location: string,
    readonly photoUrl: string | undefined,
    private readonly creationDate: Date,
    readonly creatorId: string,
    assignedResponsableId: string | undefined,
  ) {
    this.assignedResponsable = assignedResponsableId;
  }

  static create(input: CreateSignalementInput): Signalement {
    if (!(input.id instanceof SignalementId)) {
      throw new InvalidSignalementError("id", "A valid report ID is required.");
    }

    return new Signalement(
      input.id,
      requireNonBlank(input.title, "title", "signalement"),
      requireNonBlank(input.description, "description", "signalement"),
      requireNonBlank(input.category, "category", "signalement"),
      requireNonBlank(input.location, "location", "signalement"),
      optionalNonBlank(input.photoUrl, "photoUrl", "signalement"),
      copyValidDate(input.createdAt ?? new Date(), "createdAt", "signalement"),
      requireNonBlank(input.creatorId, "creatorId", "signalement"),
      optionalNonBlank(input.assignedResponsableId, "assignedResponsableId", "signalement"),
    );
  }

  get createdAt(): Date {
    return new Date(this.creationDate.getTime());
  }

  get assignedResponsableId(): string | undefined {
    return this.assignedResponsable;
  }

  get status(): Statut {
    return this.currentStatus;
  }

  get supportCount(): number {
    return this.supportingUserIds.size;
  }

  assignToResponsable(responsableId: string): void {
    this.assignedResponsable = requireNonBlank(
      responsableId,
      "assignedResponsableId",
      "signalement",
    );
  }

  supportBy(userId: string): number {
    const normalizedUserId = requireNonBlank(userId, "userId");
    if (this.supportingUserIds.has(normalizedUserId)) {
      throw new DejaSoutenuError(normalizedUserId);
    }

    this.supportingUserIds.add(normalizedUserId);
    return this.supportCount;
  }

  transitionTo(input: ChangeSignalementStatusInput): HistoriqueStatut {
    if (input.authorRole !== "RESPONSABLE" && input.authorRole !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("change report status", input.authorRole);
    }

    if (!(input.newStatus instanceof Statut)) {
      throw new InvalidSignalementError("newStatus", "A valid report status is required.");
    }

    const historyInput: CreateHistoriqueStatutInput = {
      id: input.historyId,
      signalementId: this.id,
      previousStatus: this.currentStatus,
      newStatus: input.newStatus,
      authorId: input.authorId,
      changedAt: input.changedAt,
      interventionDescription: input.interventionDescription,
    };
    const history = HistoriqueStatut.create(historyInput);
    this.currentStatus = input.newStatus;

    return history;
  }
}
