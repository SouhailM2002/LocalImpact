import {
  Commentaire,
  SignalementId,
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import type { ActorContext, CommentaireDto } from "../dto.js";
import { toCommentaireDto } from "../dto.js";
import type { Clock } from "../ports/clock.js";
import type { IdGenerator } from "../ports/id-generator.js";
import type { CommentaireRepository } from "../ports/commentaire-repository.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";

export interface AddCommentInput {
  readonly actor: ActorContext;
  readonly signalementId: string;
  readonly content: string;
}

export class AddComment {
  constructor(
    private readonly signalements: SignalementRepository,
    private readonly commentaires: CommentaireRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: AddCommentInput): Promise<CommentaireDto> {
    if (input.actor.role !== "USER") {
      throw new UnauthorizedDomainOperationError("comment on a report", input.actor.role);
    }

    const signalementId = SignalementId.create(input.signalementId);
    if (await this.signalements.findById(signalementId) === null) {
      throw new SignalementNotFoundError(signalementId.value);
    }

    const commentaire = Commentaire.create({
      id: this.ids.next(),
      signalementId,
      authorId: input.actor.userId,
      content: input.content,
      createdAt: this.clock.now(),
    });
    await this.commentaires.create(commentaire);

    return toCommentaireDto(commentaire);
  }
}
