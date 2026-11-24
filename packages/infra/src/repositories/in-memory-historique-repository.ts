import type { HistoriqueRepository } from "@localimpact/application";
import type { HistoriqueStatut, SignalementId } from "@localimpact/domain";
import { InMemoryRepositoryError } from "../errors/in-memory-repository-error.js";

export class InMemoryHistoriqueRepository implements HistoriqueRepository {
  private readonly historiesById = new Map<string, HistoriqueStatut>();

  create(history: HistoriqueStatut): Promise<void> {
    if (this.historiesById.has(history.id)) {
      return Promise.reject(new InMemoryRepositoryError(
        "RECORD_ALREADY_EXISTS",
        `A status history record with ID ${history.id} already exists.`,
      ));
    }

    this.historiesById.set(history.id, history);
    return Promise.resolve();
  }

  findBySignalementId(signalementId: SignalementId): Promise<readonly HistoriqueStatut[]> {
    const histories = [...this.historiesById.values()]
      .filter((history) => history.signalementId.equals(signalementId))
      .sort((left, right) => (
        left.changedAt.getTime() - right.changedAt.getTime() ||
        left.id.localeCompare(right.id)
      ));

    return Promise.resolve(Object.freeze(histories));
  }
}
