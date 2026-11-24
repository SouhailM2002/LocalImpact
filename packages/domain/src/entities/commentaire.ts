import { InvalidSignalementError } from "../errors/domain-error.js";
import { SignalementId } from "../value-objects/signalement-id.js";
import { copyValidDate, requireNonBlank } from "../validation.js";

export interface CreateCommentaireInput {
  readonly id: string;
  readonly signalementId: SignalementId;
  readonly authorId: string;
  readonly content: string;
  readonly createdAt?: Date;
}

export class Commentaire {
  private constructor(
    readonly id: string,
    readonly signalementId: SignalementId,
    readonly authorId: string,
    readonly content: string,
    private readonly creationDate: Date,
  ) {}

  static create(input: CreateCommentaireInput): Commentaire {
    if (!(input.signalementId instanceof SignalementId)) {
      throw new InvalidSignalementError("signalementId", "A valid report ID is required.");
    }

    return new Commentaire(
      requireNonBlank(input.id, "id"),
      input.signalementId,
      requireNonBlank(input.authorId, "authorId"),
      requireNonBlank(input.content, "content"),
      copyValidDate(input.createdAt ?? new Date(), "createdAt"),
    );
  }

  get createdAt(): Date {
    return new Date(this.creationDate.getTime());
  }
}
