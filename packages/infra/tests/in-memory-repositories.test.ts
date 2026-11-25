import {
  Commentaire,
  Signalement,
  SignalementId,
  SignalementNotFoundError,
  Statut,
} from "@localimpact/domain";
import type { HistoriqueStatut } from "@localimpact/domain";
import { beforeEach, describe, expect, it } from "vitest";
import type { Clock, NewUserRecord } from "@localimpact/application";
import {
  InMemoryCommentaireRepository,
  InMemoryHistoriqueRepository,
  InMemoryRepositoryError,
  InMemorySignalementRepository,
  InMemoryUserRepository,
} from "../src/index.js";

const createdAt = new Date("2025-03-01T10:00:00.000Z");

class FixedClock implements Clock {
  constructor(private readonly time: Date) {}

  now(): Date {
    return new Date(this.time);
  }
}

function makeSignalement(id: string, created = createdAt): Signalement {
  return Signalement.create({
    id: SignalementId.create(id),
    title: `Issue ${id}`,
    description: `Description for ${id}`,
    category: "Plomberie",
    location: "Building A, floor 2",
    creatorId: "user-1",
    createdAt: created,
  });
}

function makeUser(overrides: Partial<NewUserRecord> = {}): NewUserRecord {
  return {
    id: "user-1",
    displayName: "User One",
    email: "user@example.test",
    passwordHash: "hashed-password",
    role: "USER",
    createdAt,
    ...overrides,
  };
}

function transition(
  signalement: Signalement,
  status: string,
  id: string,
  changedAt: Date,
  interventionDescription?: string,
): HistoriqueStatut {
  return signalement.transitionTo({
    historyId: id,
    newStatus: Statut.from(status),
    authorId: "admin-1",
    authorRole: "ADMIN",
    changedAt,
    interventionDescription,
  });
}

describe("InMemorySignalementRepository", () => {
  let repository: InMemorySignalementRepository;

  beforeEach(() => {
    repository = new InMemorySignalementRepository(new FixedClock(createdAt));
  });

  it("creates, finds, and updates a report", async () => {
    const report = makeSignalement("report-1");

    await repository.create(report);
    await expect(repository.findById(report.id)).resolves.toBe(report);

    report.assignToResponsable("responsable-1");
    await repository.save(report);

    await expect(repository.findById(report.id)).resolves.toMatchObject({
      assignedResponsableId: "responsable-1",
    });
  });

  it("rejects duplicate IDs and updates for missing reports", async () => {
    const report = makeSignalement("report-1");
    await repository.create(report);

    await expect(repository.create(makeSignalement("report-1")))
      .rejects.toMatchObject({ code: "RECORD_ALREADY_EXISTS" });
    await expect(repository.save(makeSignalement("missing")))
      .rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });

  it("filters and paginates without exposing its internal report collection", async () => {
    const first = makeSignalement("first", new Date("2025-03-01T10:00:00.000Z"));
    const second = makeSignalement("second", new Date("2025-03-02T10:00:00.000Z"));
    second.assignToResponsable("responsable-2");
    await repository.create(first);
    await repository.create(second);

    const result = await repository.findAll({
      keyword: "issue second",
      category: "plomberie",
      location: "floor 2",
      assignedResponsableId: "responsable-2",
      page: 1,
      pageSize: 1,
    });

    expect(result).toEqual([second]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(await repository.findAll({ status: "EN_COURS" })).toEqual([]);
  });

  it("combines keyword, category, location, status, and assignment filters for pages and counts", async () => {
    const matching = makeSignalement("matching", new Date("2025-03-03T10:00:00.000Z"));
    matching.assignToResponsable("responsable-2");
    const wrongKeyword = makeSignalement("wrong-keyword");
    wrongKeyword.assignToResponsable("responsable-2");
    const wrongAssignment = makeSignalement(
      "wrong-assignment",
      new Date("2025-03-04T10:00:00.000Z"),
    );
    wrongAssignment.assignToResponsable("responsable-3");
    await repository.create(matching);
    await repository.create(wrongKeyword);
    await repository.create(wrongAssignment);

    const query = {
      keyword: "description for matching",
      category: "plomberie",
      location: "floor 2",
      status: "NOUVEAU" as const,
      assignedResponsableId: "responsable-2",
      page: 1,
      pageSize: 10,
    };

    await expect(repository.findAll(query)).resolves.toEqual([matching]);
    await expect(repository.countAll(query)).resolves.toBe(1);
  });

  it("enforces unique user supports and returns the support count", async () => {
    const report = makeSignalement("report-1");
    await repository.create(report);

    await expect(repository.addSupportIfAbsent(report.id, "user-2")).resolves.toBe(1);
    await expect(repository.addSupportIfAbsent(report.id, "user-2")).resolves.toBeNull();
    await expect(repository.addSupportIfAbsent(SignalementId.create("missing"), "user-3"))
      .rejects.toBeInstanceOf(SignalementNotFoundError);
    await expect(repository.findById(report.id)).resolves.toMatchObject({ supportCount: 1 });
  });

  it("aggregates status, category, and average resolution statistics", async () => {
    const day = 24 * 60 * 60 * 1000;
    repository = new InMemorySignalementRepository(
      new FixedClock(new Date(createdAt.getTime() + 3 * day)),
    );
    const report = makeSignalement("report-1");
    await repository.create(report);
    expect(await repository.averageResolutionTimeMs()).toBeNull();

    const history1 = transition(report, "PRIS_EN_CHARGE", "history-1", new Date(createdAt.getTime() + day));
    const history2 = transition(report, "EN_COURS", "history-2", new Date(createdAt.getTime() + 2 * day));
    const history3 = transition(
      report,
      "RESOLU",
      "history-3",
      new Date(createdAt.getTime() + 3 * day),
      "Repaired the issue.",
    );
    expect([history1, history2, history3]).toHaveLength(3);
    await repository.save(report);

    expect(await repository.countByStatus()).toEqual({
      NOUVEAU: 0,
      PRIS_EN_CHARGE: 0,
      EN_COURS: 0,
      RESOLU: 1,
    });
    expect(await repository.countByCategory()).toEqual([
      { category: "Plomberie", count: 1 },
    ]);
    expect(await repository.averageResolutionTimeMs()).toBe(3 * day);
  });

  it("preserves supports when a report entity instance is replaced", async () => {
    const original = makeSignalement("report-1");
    await repository.create(original);
    await repository.addSupportIfAbsent(original.id, "user-2");

    const replacement = makeSignalement("report-1");
    replacement.assignToResponsable("responsable-1");
    await repository.save(replacement);

    await expect(repository.findById(replacement.id)).resolves.toMatchObject({
      supportCount: 1,
      assignedResponsableId: "responsable-1",
    });
    await expect(repository.addSupportIfAbsent(replacement.id, "user-2")).resolves.toBeNull();
  });
});

describe("InMemoryUserRepository", () => {
  it("creates and finds copies of records by ID and normalized email", async () => {
    const repository = new InMemoryUserRepository();
    const result = await repository.create(makeUser());
    result.createdAt.setFullYear(2000);

    await expect(repository.findById("user-1")).resolves.toMatchObject({
      id: "user-1",
      createdAt,
    });
    await expect(repository.findByEmail(" USER@EXAMPLE.TEST "))
      .resolves.toMatchObject({ id: "user-1", email: "user@example.test" });
    await expect(repository.findById("missing")).resolves.toBeNull();
  });

  it("enforces unique user IDs and case-insensitive email addresses", async () => {
    const repository = new InMemoryUserRepository();
    await repository.create(makeUser());

    await expect(repository.create(makeUser({ id: "another" })))
      .rejects.toMatchObject({ code: "USER_EMAIL_ALREADY_EXISTS" });
    await expect(repository.create(makeUser({ email: "other@example.test" })))
      .rejects.toMatchObject({ code: "RECORD_ALREADY_EXISTS" });
  });

  it("returns only display names for a requested set of user IDs", async () => {
    const repository = new InMemoryUserRepository();
    await repository.create({ ...makeUser(), passwordHash: "hashed-password" });

    await expect(repository.findDisplayNames(["user-1", "missing"]))
      .resolves.toEqual([{ id: "user-1", displayName: "User One" }]);
  });
});

describe("InMemoryCommentaireRepository", () => {
  it("creates and finds comments chronologically without exposing its collection", async () => {
    const repository = new InMemoryCommentaireRepository();
    const signalementId = SignalementId.create("report-1");
    const later = Commentaire.create({
      id: "comment-2",
      signalementId,
      authorId: "user-2",
      content: "Later comment",
      createdAt: new Date(createdAt.getTime() + 1000),
    });
    const earlier = Commentaire.create({
      id: "comment-1",
      signalementId,
      authorId: "user-1",
      content: "First comment",
      createdAt,
    });
    await repository.create(later);
    await repository.create(earlier);

    const result = await repository.findBySignalementId(signalementId);
    expect(result).toEqual([earlier, later]);
    expect(Object.isFrozen(result)).toBe(true);
    await expect(repository.findBySignalementId(SignalementId.create("other")))
      .resolves.toEqual([]);
  });

  it("rejects duplicate comment IDs", async () => {
    const repository = new InMemoryCommentaireRepository();
    const comment = Commentaire.create({
      id: "comment-1",
      signalementId: SignalementId.create("report-1"),
      authorId: "user-1",
      content: "A comment",
      createdAt,
    });
    await repository.create(comment);

    await expect(repository.create(comment)).rejects.toBeInstanceOf(InMemoryRepositoryError);
  });
});

describe("InMemoryHistoriqueRepository", () => {
  it("creates and finds status history chronologically", async () => {
    const repository = new InMemoryHistoriqueRepository();
    const report = makeSignalement("report-1");
    const firstDate = new Date(createdAt.getTime() + 1000);
    const secondDate = new Date(createdAt.getTime() + 2000);
    const first = transition(report, "PRIS_EN_CHARGE", "history-1", firstDate);
    const second = transition(report, "EN_COURS", "history-2", secondDate);

    await repository.create(second);
    await repository.create(first);

    const results = await repository.findBySignalementId(report.id);
    expect(results).toEqual([first, second]);
    expect(Object.isFrozen(results)).toBe(true);
  });

  it("rejects duplicate history IDs", async () => {
    const repository = new InMemoryHistoriqueRepository();
    const history = transition(
      makeSignalement("report-1"),
      "PRIS_EN_CHARGE",
      "history-1",
      createdAt,
    );
    await repository.create(history);

    await expect(repository.create(history)).rejects.toMatchObject({
      code: "RECORD_ALREADY_EXISTS",
    });
  });
});

