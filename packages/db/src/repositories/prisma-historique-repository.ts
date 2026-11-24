import type { PrismaClient } from "@prisma/client";
import type { HistoriqueRepository } from "@localimpact/application";
import { HistoriqueStatut, SignalementId, Statut } from "@localimpact/domain";
import type { HistoriqueStatut as HistoriqueStatutEntity, SignalementId as SignalementIdValue } from "@localimpact/domain";
import { getPrismaExecutor } from "../prisma-transaction-context.js";

export class PrismaHistoriqueRepository implements HistoriqueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(history: HistoriqueStatutEntity): Promise<void> {
    await getPrismaExecutor(this.prisma).historique.create({
      data: {
        id: history.id,
        signalementId: history.signalementId.value,
        authorId: history.authorId,
        previousStatus: history.previousStatus.value,
        newStatus: history.newStatus.value,
        description: history.interventionDescription ?? null,
        createdAt: history.changedAt,
      },
    });
  }

  async findBySignalementId(
    signalementId: SignalementIdValue,
  ): Promise<readonly HistoriqueStatutEntity[]> {
    const rows = await getPrismaExecutor(this.prisma).historique.findMany({
      where: { signalementId: signalementId.value },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return Object.freeze(rows.map((row) => HistoriqueStatut.create({
      id: row.id,
      signalementId: SignalementId.create(row.signalementId),
      authorId: row.authorId,
      previousStatus: Statut.from(row.previousStatus),
      newStatus: Statut.from(row.newStatus),
      interventionDescription: row.description ?? undefined,
      changedAt: row.createdAt,
    })));
  }
}
