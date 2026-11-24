import type { PrismaClient } from "@prisma/client";
import type { CommentaireRepository } from "@localimpact/application";
import { Commentaire, SignalementId } from "@localimpact/domain";
import type { Commentaire as CommentaireEntity } from "@localimpact/domain";
import { getPrismaExecutor } from "../prisma-transaction-context.js";

export class PrismaCommentaireRepository implements CommentaireRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(commentaire: CommentaireEntity): Promise<void> {
    await getPrismaExecutor(this.prisma).commentaire.create({
      data: {
        id: commentaire.id,
        signalementId: commentaire.signalementId.value,
        authorId: commentaire.authorId,
        content: commentaire.content,
        createdAt: commentaire.createdAt,
      },
    });
  }

  async findBySignalementId(signalementId: SignalementId): Promise<readonly CommentaireEntity[]> {
    const rows = await getPrismaExecutor(this.prisma).commentaire.findMany({
      where: { signalementId: signalementId.value },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return Object.freeze(rows.map((row) => Commentaire.create({
      id: row.id,
      signalementId: SignalementId.create(row.signalementId),
      authorId: row.authorId,
      content: row.content,
      createdAt: row.createdAt,
    })));
  }
}
