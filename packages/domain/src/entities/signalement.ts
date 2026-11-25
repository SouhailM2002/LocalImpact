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
import {
  ACCESSIBILITY_BARRIER_TYPES,
  ACCESSIBILITY_IMPACTS,
  ACCESSIBILITY_URGENCIES,
} from "../accessibility.js";
import type {
  AccessibilityBarrierType,
  AccessibilityImpact,
  AccessibilityUrgency,
} from "../accessibility.js";

export interface CreateSignalementInput {
  readonly id: SignalementId;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly location: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly accessibilityBarrierType?: AccessibilityBarrierType;
  readonly accessibilityImpact?: AccessibilityImpact;
  readonly accessibilityUrgency?: AccessibilityUrgency;
  readonly photoUrl?: string;
  readonly createdAt?: Date;
  readonly creatorId: string;
  readonly assignedResponsableId?: string;
}

export interface ReconstituteSignalementInput extends CreateSignalementInput {
  readonly status: Statut;
  readonly supportCount: number;
  readonly interventionDescription?: string;
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

type SignalementMetadata = Pick<
  CreateSignalementInput,
  | "latitude"
  | "longitude"
  | "accessibilityBarrierType"
  | "accessibilityImpact"
  | "accessibilityUrgency"
>;

function validateMetadata(metadata: SignalementMetadata): void {
  const { latitude, longitude } = metadata;
  if ((latitude === undefined) !== (longitude === undefined)) {
    throw new InvalidSignalementError(
      "coordinates",
      "Latitude and longitude must be provided together.",
    );
  }
  if (
    (latitude !== undefined && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
    (longitude !== undefined && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
  ) {
    throw new InvalidSignalementError("coordinates", "Coordinates are outside valid ranges.");
  }

  const accessibilityFields = [
    metadata.accessibilityBarrierType,
    metadata.accessibilityImpact,
    metadata.accessibilityUrgency,
  ];
  const providedAccessibilityFields = accessibilityFields.filter((value) => value !== undefined).length;
  if (providedAccessibilityFields !== 0 && providedAccessibilityFields !== accessibilityFields.length) {
    throw new InvalidSignalementError(
      "accessibility",
      "Accessibility barrier, impact, and urgency must be provided together.",
    );
  }
  if (
    metadata.accessibilityBarrierType !== undefined &&
    !ACCESSIBILITY_BARRIER_TYPES.includes(metadata.accessibilityBarrierType)
  ) {
    throw new InvalidSignalementError("accessibilityBarrierType", "A valid accessibility barrier is required.");
  }
  if (
    metadata.accessibilityImpact !== undefined &&
    !ACCESSIBILITY_IMPACTS.includes(metadata.accessibilityImpact)
  ) {
    throw new InvalidSignalementError("accessibilityImpact", "A valid accessibility impact is required.");
  }
  if (
    metadata.accessibilityUrgency !== undefined &&
    !ACCESSIBILITY_URGENCIES.includes(metadata.accessibilityUrgency)
  ) {
    throw new InvalidSignalementError("accessibilityUrgency", "A valid accessibility urgency is required.");
  }
}

export class Signalement {
  private currentStatus: Statut;
  private assignedResponsable: string | undefined;
  private readonly supportingUserIds = new Set<string>();
  private readonly persistedSupportCount: number;
  private currentInterventionDescription: string | undefined;

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
    status: Statut = Statut.NOUVEAU,
    supportCount = 0,
    interventionDescription: string | undefined = undefined,
    metadata: SignalementMetadata = {},
  ) {
    this.assignedResponsable = assignedResponsableId;
    this.currentStatus = status;
    this.persistedSupportCount = supportCount;
    this.currentInterventionDescription = interventionDescription;
    this.latitude = metadata.latitude;
    this.longitude = metadata.longitude;
    this.accessibilityBarrierType = metadata.accessibilityBarrierType;
    this.accessibilityImpact = metadata.accessibilityImpact;
    this.accessibilityUrgency = metadata.accessibilityUrgency;
  }

  readonly latitude: number | undefined;
  readonly longitude: number | undefined;
  readonly accessibilityBarrierType: AccessibilityBarrierType | undefined;
  readonly accessibilityImpact: AccessibilityImpact | undefined;
  readonly accessibilityUrgency: AccessibilityUrgency | undefined;

  static create(input: CreateSignalementInput): Signalement {
    if (!(input.id instanceof SignalementId)) {
      throw new InvalidSignalementError("id", "A valid report ID is required.");
    }
    validateMetadata(input);

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
      Statut.NOUVEAU,
      0,
      undefined,
      input,
    );
  }

  static reconstitute(input: ReconstituteSignalementInput): Signalement {
    if (!(input.id instanceof SignalementId)) {
      throw new InvalidSignalementError("id", "A valid report ID is required.");
    }
    if (!(input.status instanceof Statut)) {
      throw new InvalidSignalementError("status", "A valid report status is required.");
    }
    if (!Number.isSafeInteger(input.supportCount) || input.supportCount < 0) {
      throw new InvalidSignalementError("supportCount", "Support count must be a non-negative integer.");
    }
    validateMetadata(input);

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
      input.status,
      input.supportCount,
      optionalNonBlank(input.interventionDescription, "interventionDescription", "signalement"),
      input,
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
    return this.persistedSupportCount + this.supportingUserIds.size;
  }

  get interventionDescription(): string | undefined {
    return this.currentInterventionDescription;
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
    this.currentInterventionDescription = history.interventionDescription;

    return history;
  }
}
