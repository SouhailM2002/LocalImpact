import {
  ACCESSIBILITY_BARRIER_TYPES,
  ACCESSIBILITY_IMPACTS,
  ACCESSIBILITY_URGENCIES,
  Signalement,
  SignalementId,
} from "@localimpact/domain";
import type {
  AccessibilityBarrierType,
  AccessibilityImpact,
  AccessibilityUrgency,
} from "@localimpact/domain";
import { UnauthorizedDomainOperationError } from "@localimpact/domain";
import { ApplicationValidationError } from "../errors/application-error.js";
import { PotentialDuplicateSignalementsError } from "../errors/application-error.js";
import type { ActorContext, PhotoUpload, SignalementDto } from "../dto.js";
import { toSignalementDto } from "../dto.js";
import type { Clock } from "../ports/clock.js";
import type { DuplicateSignalementDetector } from "../ports/duplicate-signalement-detector.js";
import type { FileStorage } from "../ports/file-storage.js";
import type { IdGenerator } from "../ports/id-generator.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
import { requireNonBlank } from "./application-validation.js";

export interface CreateSignalementInput {
  readonly actor: ActorContext;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly location: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly accessibilityBarrierType?: AccessibilityBarrierType;
  readonly accessibilityImpact?: AccessibilityImpact;
  readonly accessibilityUrgency?: AccessibilityUrgency;
  readonly photo?: PhotoUpload;
  readonly confirmPotentialDuplicates?: boolean;
}

export class CreateSignalement {
  constructor(
    private readonly signalements: SignalementRepository,
    private readonly fileStorage: FileStorage,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly duplicateDetector: DuplicateSignalementDetector,
  ) {}

  async execute(input: CreateSignalementInput): Promise<SignalementDto> {
    if (input.actor.role !== "USER") {
      throw new UnauthorizedDomainOperationError("create a report", input.actor.role);
    }

    const creatorId = requireNonBlank(input.actor.userId, "actor.userId");
    const title = requireNonBlank(input.title, "title");
    const description = requireNonBlank(input.description, "description");
    const category = requireNonBlank(input.category, "category");
    const location = requireNonBlank(input.location, "location");
    if (
      !Number.isFinite(input.latitude) ||
      input.latitude < -90 ||
      input.latitude > 90
    ) {
      throw new ApplicationValidationError("latitude", "Saisissez une latitude valide.");
    }
    if (
      !Number.isFinite(input.longitude) ||
      input.longitude < -180 ||
      input.longitude > 180
    ) {
      throw new ApplicationValidationError("longitude", "Saisissez une longitude valide.");
    }
    const accessibilityFields = [
      input.accessibilityBarrierType,
      input.accessibilityImpact,
      input.accessibilityUrgency,
    ];
    const accessibilityFieldCount = accessibilityFields.filter(
      (value) => value !== undefined,
    ).length;
    if (accessibilityFieldCount !== 0 && accessibilityFieldCount !== 3) {
      throw new ApplicationValidationError(
        "accessibility",
        "Renseignez le type d’obstacle, l’impact et l’urgence ensemble.",
      );
    }
    if (
      input.accessibilityBarrierType !== undefined &&
      !ACCESSIBILITY_BARRIER_TYPES.includes(input.accessibilityBarrierType)
    ) {
      throw new ApplicationValidationError(
        "accessibilityBarrierType",
        "Sélectionnez un type d’obstacle valide.",
      );
    }
    if (
      input.accessibilityImpact !== undefined &&
      !ACCESSIBILITY_IMPACTS.includes(input.accessibilityImpact)
    ) {
      throw new ApplicationValidationError(
        "accessibilityImpact",
        "Sélectionnez un impact valide.",
      );
    }
    if (
      input.accessibilityUrgency !== undefined &&
      !ACCESSIBILITY_URGENCIES.includes(input.accessibilityUrgency)
    ) {
      throw new ApplicationValidationError(
        "accessibilityUrgency",
        "Sélectionnez un niveau d’urgence valide.",
      );
    }
    if (input.photo !== undefined) {
      requireNonBlank(input.photo.fileName, "photo.fileName");
      requireNonBlank(input.photo.contentType, "photo.contentType");
      if (!(input.photo.content instanceof Uint8Array) || input.photo.content.length === 0) {
        throw new ApplicationValidationError(
          "photo.content",
          "Photo content must be a non-empty byte array.",
        );
      }
    }
    const suggestions = await this.duplicateDetector.findSimilar({
      title,
      description,
      category,
      location,
    });
    if (suggestions.length > 0 && input.confirmPotentialDuplicates !== true) {
      throw new PotentialDuplicateSignalementsError(suggestions);
    }

    const photoUrl = input.photo === undefined
      ? undefined
      : await this.fileStorage.store(input.photo);

    const signalement = Signalement.create({
      id: SignalementId.create(this.ids.next()),
      title,
      description,
      category,
      location,
      latitude: input.latitude,
      longitude: input.longitude,
      ...(input.accessibilityBarrierType === undefined
        ? {}
        : { accessibilityBarrierType: input.accessibilityBarrierType }),
      ...(input.accessibilityImpact === undefined
        ? {}
        : { accessibilityImpact: input.accessibilityImpact }),
      ...(input.accessibilityUrgency === undefined
        ? {}
        : { accessibilityUrgency: input.accessibilityUrgency }),
      photoUrl,
      createdAt: this.clock.now(),
      creatorId,
    });

    await this.signalements.create(signalement);

    return toSignalementDto(signalement);
  }
}
