import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  CategoryReportCount,
  Clock,
  SignalementRepository,
  SignalementSearchQuery,
} from "@localimpact/application";
import { SignalementNotFoundError, Signalement, SignalementId, Statut } from "@localimpact/domain";
import type { StatutValue } from "@localimpact/domain";
import { getPrismaExecutor } from "../prisma-transaction-context.js";

const signalementWithSupportCount = {
  _count: {
    select: {
      soutiens: true,
    },
  },
} satisfies Prisma.SignalementInclude;

type SignalementWithSupportCount = Prisma.SignalementGetPayload<{
  include: typeof signalementWithSupportCount;
}>;

function toDomainSignalement(row: SignalementWithSupportCount): Signalement {
  return Signalement.reconstitute({
    id: SignalementId.create(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    photoUrl: row.photoUrl ?? undefined,
    createdAt: row.createdAt,
    creatorId: row.creatorId,
    assignedResponsableId: row.responsableId ?? undefined,
    status: Statut.from(row.status),
    supportCount: row._count.soutiens,
    interventionDescription: row.interventionDescription ?? undefined,
  });
}

function buildSignalementWhere(query: SignalementSearchQuery): Prisma.SignalementWhereInput {
  const where: Prisma.SignalementWhereInput = {};
  if (query.keyword !== undefined) {
    where.OR = [
      { title: { contains: query.keyword, mode: "insensitive" } },
      { description: { contains: query.keyword, mode: "insensitive" } },
    ];
  }
  if (query.category !== undefined) {
    where.category = { equals: query.category, mode: "insensitive" };
  }
  if (query.location !== undefined) {
    where.location = { contains: query.location, mode: "insensitive" };
  }
  if (query.status !== undefined) {
    where.status = query.status;
  }
  if (query.assignedResponsableId !== undefined) {
    where.responsableId = query.assignedResponsableId;
  }

  return where;
}

export class PrismaSignalementRepository implements SignalementRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly clock: Clock,
  ) {}

  async create(signalement: Signalement): Promise<void> {
    await getPrismaExecutor(this.prisma).signalement.create({
      data: {
        id: signalement.id.value,
        title: signalement.title,
        description: signalement.description,
        category: signalement.category,
        location: signalement.location,
        photoUrl: signalement.photoUrl ?? null,
        status: signalement.status.value,
        creatorId: signalement.creatorId,
        responsableId: signalement.assignedResponsableId ?? null,
        interventionDescription: signalement.interventionDescription ?? null,
        createdAt: signalement.createdAt,
      },
    });
  }

  async save(signalement: Signalement): Promise<void> {
    const db = getPrismaExecutor(this.prisma);
    const existing = await db.signalement.findUnique({
      where: { id: signalement.id.value },
      select: {
        status: true,
        resolvedAt: true,
      },
    });
    if (existing === null) {
      throw new SignalementNotFoundError(signalement.id.value);
    }

    const resolvedAt = signalement.status.value === "RESOLU"
      ? existing.status === "RESOLU"
        ? existing.resolvedAt
        : this.clock.now()
      : null;

    await db.signalement.update({
      where: { id: signalement.id.value },
      data: {
        title: signalement.title,
        description: signalement.description,
        category: signalement.category,
        location: signalement.location,
        photoUrl: signalement.photoUrl ?? null,
        status: signalement.status.value,
        responsableId: signalement.assignedResponsableId ?? null,
        interventionDescription: signalement.interventionDescription ?? null,
        resolvedAt,
      },
    });
  }

  async findById(id: SignalementId): Promise<Signalement | null> {
    const row = await getPrismaExecutor(this.prisma).signalement.findUnique({
      where: { id: id.value },
      include: signalementWithSupportCount,
    });

    return row === null ? null : toDomainSignalement(row);
  }

  async findAll(query: SignalementSearchQuery): Promise<readonly Signalement[]> {
    const paginationRequested = query.page !== undefined || query.pageSize !== undefined;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const rows = await getPrismaExecutor(this.prisma).signalement.findMany({
      where: buildSignalementWhere(query),
      include: signalementWithSupportCount,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      ...(paginationRequested
        ? {
            skip: (page - 1) * pageSize,
            take: pageSize,
          }
        : {}),
    });

    return rows.map(toDomainSignalement);
  }

  async countAll(query: SignalementSearchQuery): Promise<number> {
    return getPrismaExecutor(this.prisma).signalement.count({
      where: buildSignalementWhere(query),
    });
  }

  async addSupportIfAbsent(signalementId: SignalementId, userId: string): Promise<number | null> {
    const db = getPrismaExecutor(this.prisma);
    try {
      await db.soutien.create({
        data: {
          userId,
          signalementId: signalementId.value,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return null;
      }
      throw error;
    }

    return db.soutien.count({ where: { signalementId: signalementId.value } });
  }

  async countByStatus(): Promise<Readonly<Record<StatutValue, number>>> {
    const rows = await getPrismaExecutor(this.prisma).signalement.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const counts: Record<StatutValue, number> = {
      NOUVEAU: 0,
      PRIS_EN_CHARGE: 0,
      EN_COURS: 0,
      RESOLU: 0,
    };

    for (const row of rows) {
      counts[row.status] = row._count._all;
    }

    return Object.freeze(counts);
  }

  async countByCategory(): Promise<readonly CategoryReportCount[]> {
    const rows = await getPrismaExecutor(this.prisma).signalement.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { category: "asc" },
    });

    return Object.freeze(rows.map((row) => Object.freeze({
      category: row.category,
      count: row._count._all,
    })));
  }

  async averageResolutionTimeMs(): Promise<number | null> {
    const rows = await getPrismaExecutor(this.prisma).signalement.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });
    const durations = rows.flatMap((row) =>
      row.resolvedAt === null
        ? []
        : [row.resolvedAt.getTime() - row.createdAt.getTime()],
    );
    if (durations.length === 0) {
      return null;
    }

    return durations.reduce((total, duration) => total + duration, 0) / durations.length;
  }
}
