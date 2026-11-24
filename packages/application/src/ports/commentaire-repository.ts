import type { Commentaire, SignalementId } from "@localimpact/domain";

export interface CommentaireRepository {
  create(commentaire: Commentaire): Promise<void>;
  findBySignalementId(signalementId: SignalementId): Promise<readonly Commentaire[]>;
}
