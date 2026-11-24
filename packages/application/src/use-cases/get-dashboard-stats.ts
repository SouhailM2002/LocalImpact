import { UnauthorizedDomainOperationError } from "@localimpact/domain";
import type { ActorContext, DashboardStatsDto } from "../dto.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";

export class GetDashboardStats {
  constructor(private readonly signalements: SignalementRepository) {}

  async execute(actor: ActorContext): Promise<DashboardStatsDto> {
    if (actor.role !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("view dashboard statistics", actor.role);
    }

    const [countsByStatus, countsByCategory, averageResolutionTimeMs] = await Promise.all([
      this.signalements.countByStatus(),
      this.signalements.countByCategory(),
      this.signalements.averageResolutionTimeMs(),
    ]);

    return {
      countsByStatus,
      countsByCategory,
      averageResolutionTimeMs,
    };
  }
}
