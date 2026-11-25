import { SignalementId } from "@localimpact/domain";
import type {
  ActorContext,
  SignalementDetailDto,
} from "../dto.js";
import {
  toCommentaireDto,
  toHistoriqueStatutDto,
} from "../dto.js";
import type { CommentaireRepository } from "../ports/commentaire-repository.js";
import type { HistoriqueRepository } from "../ports/historique-repository.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
import type { UserRepository } from "../ports/user-repository.js";
import type { GetSignalementById } from "./get-signalement-by-id.js";

export interface GetSignalementDetailInput {
  readonly actor: ActorContext;
  readonly signalementId: string;
}

export class GetSignalementDetail {
  constructor(
    private readonly getSignalementById: GetSignalementById,
    private readonly commentaires: CommentaireRepository,
    private readonly historiques: HistoriqueRepository,
    private readonly users: UserRepository,
    private readonly signalements: SignalementRepository,
  ) {}

  async execute(input: GetSignalementDetailInput): Promise<SignalementDetailDto> {
    const report = await this.getSignalementById.execute(input);
    const signalementId = SignalementId.create(input.signalementId);
    const [comments, history, viewerHasSupported] = await Promise.all([
      this.commentaires.findBySignalementId(signalementId),
      this.historiques.findBySignalementId(signalementId),
      input.actor.role === "USER"
        ? this.signalements.hasSupported(signalementId, input.actor.userId)
        : Promise.resolve(false),
    ]);
    const userIds = [...new Set([
      report.creatorId,
      ...(report.assignedResponsableId === undefined
        ? []
        : [report.assignedResponsableId]),
      ...comments.map((comment) => comment.authorId),
      ...history.map((item) => item.authorId),
    ])];
    const users = await this.users.findDisplayNames(userIds);
    const displayNames = new Map(
      users.map(({ id, displayName }) => [id, displayName]),
    );

    return {
      report: {
        ...report,
        creatorDisplayName: displayNames.get(report.creatorId) ?? null,
        assignedResponsableDisplayName:
          report.assignedResponsableId === undefined
            ? null
            : displayNames.get(report.assignedResponsableId) ?? null,
      },
      viewerHasSupported,
      statusHistory: history
        .map((item) => ({
          ...toHistoriqueStatutDto(item),
          authorDisplayName: displayNames.get(item.authorId) ?? null,
        }))
        .sort((left, right) => (
          left.changedAt.getTime() - right.changedAt.getTime() ||
          left.id.localeCompare(right.id)
        )),
      comments: comments
        .map((comment) => ({
          ...toCommentaireDto(comment),
          authorDisplayName: displayNames.get(comment.authorId) ?? null,
        }))
        .sort((left, right) => (
          left.createdAt.getTime() - right.createdAt.getTime() ||
          left.id.localeCompare(right.id)
        )),
    };
  }
}
