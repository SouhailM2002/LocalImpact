import type { Signalement } from "@localimpact/domain";
import type { SignalementId, StatutValue } from "@localimpact/domain";
import type { CategoryReportCount, SignalementSearchQuery } from "../dto.js";

export interface SignalementRepository {
  create(signalement: Signalement): Promise<void>;
  save(signalement: Signalement): Promise<void>;
  findById(id: SignalementId): Promise<Signalement | null>;
  findAll(query: SignalementSearchQuery): Promise<readonly Signalement[]>;
  countAll(query: SignalementSearchQuery): Promise<number>;

  /**
   * Atomically records a user's support and returns the updated count.
   * Returns null if the user has already supported this report.
   */
  addSupportIfAbsent(signalementId: SignalementId, userId: string): Promise<number | null>;
  hasSupported(signalementId: SignalementId, userId: string): Promise<boolean>;

  countByStatus(): Promise<Readonly<Record<StatutValue, number>>>;
  countByCategory(): Promise<readonly CategoryReportCount[]>;
  averageResolutionTimeMs(): Promise<number | null>;
}
