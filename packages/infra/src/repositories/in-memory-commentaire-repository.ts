import type { CommentaireRepository } from "@localimpact/application";
import type { Commentaire, SignalementId } from "@localimpact/domain";
import { InMemoryRepositoryError } from "../errors/in-memory-repository-error.js";

export class InMemoryCommentaireRepository implements CommentaireRepository {
  private readonly commentairesById = new Map<string, Commentaire>();

  create(commentaire: Commentaire): Promise<void> {
    if (this.commentairesById.has(commentaire.id)) {
      return Promise.reject(new InMemoryRepositoryError(
        "RECORD_ALREADY_EXISTS",
        `A comment with ID ${commentaire.id} already exists.`,
      ));
    }

    this.commentairesById.set(commentaire.id, commentaire);
    return Promise.resolve();
  }

  findBySignalementId(signalementId: SignalementId): Promise<readonly Commentaire[]> {
    const commentaires = [...this.commentairesById.values()]
      .filter((commentaire) => commentaire.signalementId.equals(signalementId))
      .sort((left, right) => (
        left.createdAt.getTime() - right.createdAt.getTime() ||
        left.id.localeCompare(right.id)
      ));

    return Promise.resolve(Object.freeze(commentaires));
  }
}
