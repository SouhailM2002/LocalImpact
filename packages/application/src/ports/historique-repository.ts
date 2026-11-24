import type { HistoriqueStatut, SignalementId } from "@localimpact/domain";

export interface HistoriqueRepository {
  create(history: HistoriqueStatut): Promise<void>;
  findBySignalementId(signalementId: SignalementId): Promise<readonly HistoriqueStatut[]>;
}
