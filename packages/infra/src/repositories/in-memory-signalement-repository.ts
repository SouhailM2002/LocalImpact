import type { Clock } from "@localimpact/application";
import type {
  CategoryReportCount,
  SignalementSearchQuery,
  SignalementRepository,
} from "@localimpact/application";
import { SignalementNotFoundError } from "@localimpact/domain";
import type { Signalement, SignalementId, StatutValue } from "@localimpact/domain";
import { InMemoryRepositoryError } from "../errors/in-memory-repository-error.js";

const systemClock: Clock = {
  now: () => new Date(),
};

function equalIgnoreCase(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export class InMemorySignalementRepository implements SignalementRepository {
  private readonly signalements = new Map<string, Signalement>();
  private readonly supports = new Map<string, Set<string>>();
  private readonly savedStatuses = new Map<string, StatutValue>();
  private readonly resolvedAt = new Map<string, Date>();

  constructor(private readonly clock: Clock = systemClock) {}

  create(signalement: Signalement): Promise<void> {
    const id = signalement.id.value;
    if (this.signalements.has(id)) {
      return Promise.reject(new InMemoryRepositoryError(
        "RECORD_ALREADY_EXISTS",
        `A report with ID ${id} already exists.`,
      ));
    }

    this.signalements.set(id, signalement);
    this.savedStatuses.set(id, signalement.status.value);
    return Promise.resolve();
  }

  save(signalement: Signalement): Promise<void> {
    const id = signalement.id.value;
    const previous = this.signalements.get(id);
    if (previous === undefined) {
      return Promise.reject(new InMemoryRepositoryError(
        "RECORD_NOT_FOUND",
        `Cannot update report ${id} because it does not exist.`,
      ));
    }

    if (
      previous !== signalement &&
      signalement.supportCount === 0
    ) {
      for (const userId of this.supports.get(id) ?? []) {
        signalement.supportBy(userId);
      }
    }

    const previousStatus = this.savedStatuses.get(id);
    if (previousStatus !== "RESOLU" && signalement.status.value === "RESOLU") {
      this.resolvedAt.set(id, this.clock.now());
    }

    this.signalements.set(id, signalement);
    this.savedStatuses.set(id, signalement.status.value);
    return Promise.resolve();
  }

  findById(id: SignalementId): Promise<Signalement | null> {
    return Promise.resolve(this.signalements.get(id.value) ?? null);
  }

  findAll(query: SignalementSearchQuery): Promise<readonly Signalement[]> {
    const keyword = query.keyword?.toLowerCase();
    const location = query.location?.toLowerCase();
    const results = [...this.signalements.values()]
      .filter((signalement) => (
        keyword === undefined ||
        signalement.title.toLowerCase().includes(keyword) ||
        signalement.description.toLowerCase().includes(keyword)
      ))
      .filter((signalement) => (
        query.category === undefined ||
        equalIgnoreCase(signalement.category, query.category)
      ))
      .filter((signalement) => (
        location === undefined ||
        signalement.location.toLowerCase().includes(location)
      ))
      .filter((signalement) => (
        query.status === undefined ||
        signalement.status.value === query.status
      ))
      .filter((signalement) => (
        query.assignedResponsableId === undefined ||
        signalement.assignedResponsableId === query.assignedResponsableId
      ))
      .sort((left, right) => (
        right.createdAt.getTime() - left.createdAt.getTime() ||
        left.id.value.localeCompare(right.id.value)
      ));

    if (query.page === undefined && query.pageSize === undefined) {
      return Promise.resolve(Object.freeze(results));
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    return Promise.resolve(Object.freeze(results.slice(start, start + pageSize)));
  }

  addSupportIfAbsent(signalementId: SignalementId, userId: string): Promise<number | null> {
    const signalement = this.signalements.get(signalementId.value);
    if (signalement === undefined) {
      return Promise.reject(new SignalementNotFoundError(signalementId.value));
    }

    let users = this.supports.get(signalementId.value);
    if (users?.has(userId) === true) {
      return Promise.resolve(null);
    }

    const supportCount = signalement.supportBy(userId);
    if (users === undefined) {
      users = new Set<string>();
      this.supports.set(signalementId.value, users);
    }
    users.add(userId);

    return Promise.resolve(supportCount);
  }

  countByStatus(): Promise<Readonly<Record<StatutValue, number>>> {
    const counts: Record<StatutValue, number> = {
      NOUVEAU: 0,
      PRIS_EN_CHARGE: 0,
      EN_COURS: 0,
      RESOLU: 0,
    };

    for (const signalement of this.signalements.values()) {
      counts[signalement.status.value] += 1;
    }

    return Promise.resolve(Object.freeze(counts));
  }

  countByCategory(): Promise<readonly CategoryReportCount[]> {
    const counts = new Map<string, number>();
    for (const signalement of this.signalements.values()) {
      counts.set(signalement.category, (counts.get(signalement.category) ?? 0) + 1);
    }

    return Promise.resolve(Object.freeze(
      [...counts.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([category, count]) => Object.freeze({ category, count })),
    ));
  }

  averageResolutionTimeMs(): Promise<number | null> {
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const [id, resolvedAt] of this.resolvedAt) {
      const signalement = this.signalements.get(id);
      if (signalement === undefined) {
        continue;
      }
      totalResolutionTime += resolvedAt.getTime() - signalement.createdAt.getTime();
      resolvedCount += 1;
    }

    return Promise.resolve(resolvedCount === 0 ? null : totalResolutionTime / resolvedCount);
  }
}
