import { Signalement, SignalementId } from "@localimpact/domain";
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
      photoUrl,
      createdAt: this.clock.now(),
      creatorId,
    });

    await this.signalements.create(signalement);

    return toSignalementDto(signalement);
  }
}
