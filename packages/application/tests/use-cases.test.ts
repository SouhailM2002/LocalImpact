import {
  DejaSoutenuError,
  DescriptionInterventionRequiseError,
  Commentaire,
  HistoriqueStatut,
  Signalement,
  SignalementId,
  SignalementNotFoundError,
  Statut,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import { beforeEach, describe, expect, it } from "vitest";
import type {
  CategoryReportCount,
  NewUserRecord,
  PhotoUpload,
  SignalementSearchQuery,
  UserRecord,
} from "../src/dto.js";
import {
  AddComment,
  AssignResponsable,
  AuthenticateUser,
  ChangeSignalementStatus,
  ChangeUserRole,
  CreateSignalement,
  GetDashboardStats,
  GetResponsables,
  GetUsersForAdmin,
  GetSignalementById,
  GetSignalementDetail,
  GetSignalements,
  InvalidCredentialsError,
  RegisterUser,
  SelfRoleChangeError,
  SupportSignalement,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../src/index.js";
import type { Clock } from "../src/ports/clock.js";
import type { CommentaireRepository } from "../src/ports/commentaire-repository.js";
import type {
  DuplicateSignalementDetector,
  DuplicateSignalementQuery,
  DuplicateSignalementSuggestion,
} from "../src/ports/duplicate-signalement-detector.js";
import type { FileStorage } from "../src/ports/file-storage.js";
import type { HistoriqueRepository } from "../src/ports/historique-repository.js";
import type { IdGenerator } from "../src/ports/id-generator.js";
import type { PasswordHasher } from "../src/ports/password-hasher.js";
import type { SignalementRepository } from "../src/ports/signalement-repository.js";
import type { TransactionManager } from "../src/ports/transaction-manager.js";
import type { UserRepository } from "../src/ports/user-repository.js";

const fixedDate = new Date("2025-01-02T03:04:05.000Z");

class FakeClock implements Clock {
  now(): Date {
    return new Date(fixedDate);
  }
}

class FakeIdGenerator implements IdGenerator {
  private nextValue = 0;

  next(): string {
    this.nextValue += 1;
    return `id-${this.nextValue}`;
  }
}

class FakeFileStorage implements FileStorage {
  readonly stored: PhotoUpload[] = [];

  store(file: PhotoUpload): Promise<string> {
    this.stored.push(file);
    return Promise.resolve(`https://files.local/${file.fileName}`);
  }
}

class FakeDuplicateSignalementDetector implements DuplicateSignalementDetector {
  constructor(
    private readonly suggestions: readonly DuplicateSignalementSuggestion[] = [],
  ) {}

  findSimilar(
    _query: DuplicateSignalementQuery,
  ): Promise<readonly DuplicateSignalementSuggestion[]> {
    return Promise.resolve(this.suggestions);
  }
}

class FakePasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return Promise.resolve(`hashed:${password}`);
  }

  verify(password: string, passwordHash: string): Promise<boolean> {
    return Promise.resolve(passwordHash === `hashed:${password}`);
  }
}

class FakeSignalementRepository implements SignalementRepository {
  readonly items = new Map<string, Signalement>();
  readonly supports = new Map<string, Set<string>>();
  readonly queries: SignalementSearchQuery[] = [];
  readonly countQueries: SignalementSearchQuery[] = [];
  readonly categoryCounts: readonly CategoryReportCount[] = [
    { category: "Plomberie", count: 1 },
  ];
  lastAverageResolutionTime: number | null = 1234;

  create(signalement: Signalement): Promise<void> {
    this.items.set(signalement.id.value, signalement);
    return Promise.resolve();
  }

  save(signalement: Signalement): Promise<void> {
    this.items.set(signalement.id.value, signalement);
    return Promise.resolve();
  }

  findById(id: SignalementId): Promise<Signalement | null> {
    return Promise.resolve(this.items.get(id.value) ?? null);
  }

  private matchingReports(query: SignalementSearchQuery): Signalement[] {
    const keyword = query.keyword?.toLowerCase();
    const location = query.location?.toLowerCase();

    return [...this.items.values()].filter((report) => (
      (keyword === undefined ||
        report.title.toLowerCase().includes(keyword) ||
        report.description.toLowerCase().includes(keyword)) &&
      (query.category === undefined ||
        report.category.toLowerCase() === query.category.toLowerCase()) &&
      (location === undefined ||
        report.location.toLowerCase().includes(location)) &&
      (query.status === undefined || report.status.value === query.status) &&
      (query.assignedResponsableId === undefined ||
        report.assignedResponsableId === query.assignedResponsableId)
    ));
  }

  findAll(query: SignalementSearchQuery): Promise<readonly Signalement[]> {
    this.queries.push(query);
    const results = this.matchingReports(query);
    if (query.page === undefined && query.pageSize === undefined) {
      return Promise.resolve(results);
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    return Promise.resolve(results.slice((page - 1) * pageSize, page * pageSize));
  }

  countAll(query: SignalementSearchQuery): Promise<number> {
    this.countQueries.push(query);
    return Promise.resolve(this.matchingReports(query).length);
  }

  addSupportIfAbsent(id: SignalementId, userId: string): Promise<number | null> {
    if (!this.items.has(id.value)) {
      return Promise.resolve(null);
    }

    const users = this.supports.get(id.value) ?? new Set<string>();
    if (users.has(userId)) {
      return Promise.resolve(null);
    }

    users.add(userId);
    this.supports.set(id.value, users);
    return Promise.resolve(users.size);
  }

  countByStatus(): Promise<Readonly<Record<"NOUVEAU" | "PRIS_EN_CHARGE" | "EN_COURS" | "RESOLU", number>>> {
    const counts = { NOUVEAU: 0, PRIS_EN_CHARGE: 0, EN_COURS: 0, RESOLU: 0 };
    for (const signalement of this.items.values()) {
      counts[signalement.status.value] += 1;
    }
    return Promise.resolve(counts);
  }

  countByCategory(): Promise<readonly CategoryReportCount[]> {
    return Promise.resolve(this.categoryCounts);
  }

  averageResolutionTimeMs(): Promise<number | null> {
    return Promise.resolve(this.lastAverageResolutionTime);
  }
}

class FakeUserRepository implements UserRepository {
  readonly items = new Map<string, UserRecord>();

  findById(userId: string): Promise<UserRecord | null> {
    return Promise.resolve(this.items.get(userId) ?? null);
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    return Promise.resolve([...this.items.values()].find((user) => user.email === email) ?? null);
  }

  findDisplayNames(userIds: readonly string[]) {
    return Promise.resolve(userIds.flatMap((id) => {
      const user = this.items.get(id);
      return user === undefined ? [] : [{ id, displayName: user.displayName }];
    }));
  }

  findDisplayNamesByRole(role: UserRecord["role"]) {
    return Promise.resolve([...this.items.values()]
      .filter((user) => user.role === role)
      .map(({ id, displayName }) => ({ id, displayName })));
  }

  findAllForAdmin() {
    return Promise.resolve([...this.items.values()]
      .map(({ id, displayName, email, role }) => ({ id, displayName, email, role })));
  }

  changeRole(userId: string, role: UserRecord["role"]) {
    const user = this.items.get(userId);
    if (user === undefined) {
      return Promise.resolve({ kind: "not_found" as const });
    }
    if (user.role === role) {
      return Promise.resolve({ kind: "updated" as const, user });
    }
    if (
      user.role === "ADMIN" &&
      role !== "ADMIN" &&
      [...this.items.values()].filter((item) => item.role === "ADMIN").length <= 1
    ) {
      return Promise.resolve({ kind: "last_admin" as const });
    }

    const updated = { ...user, role };
    this.items.set(userId, updated);
    return Promise.resolve({ kind: "updated" as const, user: updated });
  }

  create(user: NewUserRecord): Promise<UserRecord> {
    this.items.set(user.id, user);
    return Promise.resolve(user);
  }
}

class FakeCommentaireRepository implements CommentaireRepository {
  readonly items: Commentaire[] = [];

  create(commentaire: Commentaire): Promise<void> {
    this.items.push(commentaire);
    return Promise.resolve();
  }

  findBySignalementId(id: SignalementId): Promise<readonly Commentaire[]> {
    return Promise.resolve(this.items.filter((item) => item.signalementId.equals(id)));
  }
}

class FakeHistoriqueRepository implements HistoriqueRepository {
  readonly items: HistoriqueStatut[] = [];

  create(history: HistoriqueStatut): Promise<void> {
    this.items.push(history);
    return Promise.resolve();
  }

  findBySignalementId(id: SignalementId): Promise<readonly HistoriqueStatut[]> {
    return Promise.resolve(this.items.filter((item) => item.signalementId.equals(id)));
  }
}

class FakeTransactionManager implements TransactionManager {
  async run<T>(operation: () => Promise<T>): Promise<T> {
    return operation();
  }
}

function makeSignalement(id = "report-1"): Signalement {
  return Signalement.create({
    id: SignalementId.create(id),
    title: "Broken light",
    description: "The light in the corridor is broken.",
    category: "Electrical",
    location: "Building A",
    creatorId: "user-1",
    createdAt: fixedDate,
  });
}

function makeUser(
  id: string,
  role: UserRecord["role"],
  email = `${id}@example.test`,
): UserRecord {
  return {
    id,
    displayName: id,
    email,
    passwordHash: "hashed:password123",
    role,
    createdAt: fixedDate,
  };
}

describe("Application use cases", () => {
  let signalements: FakeSignalementRepository;
  let users: FakeUserRepository;
  let commentaires: FakeCommentaireRepository;
  let histories: FakeHistoriqueRepository;
  let clock: FakeClock;
  let ids: FakeIdGenerator;

  beforeEach(() => {
    signalements = new FakeSignalementRepository();
    users = new FakeUserRepository();
    commentaires = new FakeCommentaireRepository();
    histories = new FakeHistoriqueRepository();
    clock = new FakeClock();
    ids = new FakeIdGenerator();
  });

  it("creates a valid report and stores an optional photo", async () => {
    const storage = new FakeFileStorage();
    const create = new CreateSignalement(
      signalements,
      storage,
      clock,
      ids,
      new FakeDuplicateSignalementDetector(),
    );
    const photo: PhotoUpload = {
      fileName: "light.jpg",
      contentType: "image/jpeg",
      content: new Uint8Array([1, 2, 3]),
    };

    const result = await create.execute({
      actor: { userId: "user-1", role: "USER" },
      title: "  Broken light ",
      description: " The corridor light is broken. ",
      category: " Electrical ",
      location: " Building A ",
      photo,
    });

    expect(result).toMatchObject({
      title: "Broken light",
      category: "Electrical",
      location: "Building A",
      photoUrl: "https://files.local/light.jpg",
      status: "NOUVEAU",
      creatorId: "user-1",
      createdAt: fixedDate,
    });
    expect(storage.stored).toEqual([photo]);
    expect(signalements.items.size).toBe(1);
  });

  it("requires confirmation for similar reports before storing photos or creating a report", async () => {
    const storage = new FakeFileStorage();
    const suggestion: DuplicateSignalementSuggestion = {
      id: "existing-report",
      title: "Broken corridor light",
      category: "Electrical",
      location: "Building A",
      status: "NOUVEAU",
      supportCount: 2,
    };
    const create = new CreateSignalement(
      signalements,
      storage,
      clock,
      ids,
      new FakeDuplicateSignalementDetector([suggestion]),
    );
    const input = {
      actor: { userId: "user-1", role: "USER" as const },
      title: "Broken light",
      description: "The corridor light is broken.",
      category: "Electrical",
      location: "Building A",
      photo: {
        fileName: "light.jpg",
        contentType: "image/jpeg",
        content: new Uint8Array([1, 2, 3]),
      },
    };

    await expect(create.execute(input)).rejects.toMatchObject({
      code: "POTENTIAL_DUPLICATES",
      suggestions: [suggestion],
    });
    expect(storage.stored).toHaveLength(0);
    expect(signalements.items.size).toBe(0);

    await expect(create.execute({
      ...input,
      confirmPotentialDuplicates: true,
    })).resolves.toMatchObject({ title: "Broken light" });
    expect(storage.stored).toHaveLength(1);
    expect(signalements.items.size).toBe(1);
  });

  it("rejects privileged roles from creating user reports", async () => {
    const create = new CreateSignalement(
      signalements,
      new FakeFileStorage(),
      clock,
      ids,
      new FakeDuplicateSignalementDetector(),
    );

    await expect(create.execute({
      actor: { userId: "admin-1", role: "ADMIN" },
      title: "Broken light",
      description: "Description",
      category: "Electrical",
      location: "Building A",
    })).rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
  });

  it("lists reports using the supplied search and pagination filters", async () => {
    signalements.items.set("report-1", makeSignalement());
    users.items.set("user-1", makeUser("user-1", "USER"));
    const query: SignalementSearchQuery = {
      keyword: "light",
      category: "Electrical",
      location: "Building A",
      status: "NOUVEAU",
      page: 1,
      pageSize: 10,
    };

    const result = await new GetSignalements(signalements, users).execute({
      actor: { userId: "user-1", role: "USER" },
      query,
    });

    expect(result).toMatchObject({
      reports: [{ id: "report-1", creatorDisplayName: "user-1" }],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    });
    expect(signalements.queries).toEqual([query]);
    expect(signalements.countQueries).toEqual([{
      keyword: "light",
      category: "Electrical",
      location: "Building A",
      status: "NOUVEAU",
    }]);
  });

  it("scopes responsable report lists to their own assignments", async () => {
    const assigned = makeSignalement("assigned");
    assigned.assignToResponsable("responsable-1");
    signalements.items.set("assigned", assigned);
    signalements.items.set("unassigned", makeSignalement("unassigned"));

    const results = await new GetSignalements(signalements, users).execute({
      actor: { userId: "responsable-1", role: "RESPONSABLE" },
      query: {
        category: "Electrical",
        assignedResponsableId: "responsable-2",
      },
    });

    expect(signalements.queries).toEqual([{
      category: "Electrical",
      assignedResponsableId: "responsable-1",
      page: 1,
      pageSize: 20,
    }]);
    expect(results.reports.map((result) => result.id)).toEqual(["assigned"]);
    expect(results.totalCount).toBe(1);
    expect(signalements.countQueries).toEqual([{
      category: "Electrical",
      assignedResponsableId: "responsable-1",
    }]);
  });

  it("reports pagination totals and clamps pages past the final result", async () => {
    signalements.items.set("report-1", makeSignalement("report-1"));
    signalements.items.set("report-2", makeSignalement("report-2"));

    const result = await new GetSignalements(signalements, users).execute({
      actor: { userId: "user-1", role: "USER" },
      query: { page: 8, pageSize: 1 },
    });

    expect(result).toMatchObject({
      reports: [{ id: "report-2" }],
      page: 2,
      pageSize: 1,
      totalCount: 2,
      totalPages: 2,
    });
  });

  it("rejects invalid pagination", async () => {
    await expect(new GetSignalements(signalements, users).execute({
      actor: { userId: "user-1", role: "USER" },
      query: { pageSize: 101 },
    }))
      .rejects.toThrow("Page size must be between 1 and 100.");
  });

  it("retrieves a report by ID and reports missing or unassigned records", async () => {
    signalements.items.set("report-1", makeSignalement());
    const getById = new GetSignalementById(signalements);

    await expect(getById.execute({
      actor: { userId: "user-1", role: "USER" },
      signalementId: "report-1",
    })).resolves.toMatchObject({ id: "report-1" });
    await expect(getById.execute({
      actor: { userId: "user-1", role: "USER" },
      signalementId: "missing",
    })).rejects.toBeInstanceOf(SignalementNotFoundError);
    await expect(getById.execute({
      actor: { userId: "responsable-1", role: "RESPONSABLE" },
      signalementId: "report-1",
    })).rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
  });

  it("loads detail authors and orders comments and status history chronologically", async () => {
    const report = makeSignalement("report-detail");
    report.assignToResponsable("responsable-1");
    signalements.items.set(report.id.value, report);
    users.items.set("user-1", makeUser("user-1", "USER"));
    users.items.set("responsable-1", makeUser("responsable-1", "RESPONSABLE"));
    users.items.set("admin-1", makeUser("admin-1", "ADMIN"));
    users.items.set("user-2", makeUser("user-2", "USER"));

    const earlier = new Date(fixedDate.getTime() + 1_000);
    const later = new Date(fixedDate.getTime() + 2_000);
    histories.items.push(
      HistoriqueStatut.create({
        id: "history-later",
        signalementId: report.id,
        previousStatus: Statut.from("PRIS_EN_CHARGE"),
        newStatus: Statut.from("EN_COURS"),
        authorId: "admin-1",
        changedAt: later,
      }),
      HistoriqueStatut.create({
        id: "history-earlier",
        signalementId: report.id,
        previousStatus: Statut.from("NOUVEAU"),
        newStatus: Statut.from("PRIS_EN_CHARGE"),
        authorId: "responsable-1",
        changedAt: earlier,
      }),
    );
    commentaires.items.push(
      Commentaire.create({
        id: "comment-later",
        signalementId: report.id,
        authorId: "user-2",
        content: "A later comment",
        createdAt: later,
      }),
      Commentaire.create({
        id: "comment-earlier",
        signalementId: report.id,
        authorId: "user-1",
        content: "An earlier comment",
        createdAt: earlier,
      }),
    );

    const detail = await new GetSignalementDetail(
      new GetSignalementById(signalements),
      commentaires,
      histories,
      users,
    ).execute({
      actor: { userId: "user-1", role: "USER" },
      signalementId: report.id.value,
    });

    expect(detail.report).toMatchObject({
      creatorDisplayName: "user-1",
      assignedResponsableDisplayName: "responsable-1",
    });
    expect(detail.statusHistory.map(({ id, authorDisplayName }) => ({
      id,
      authorDisplayName,
    }))).toEqual([
      { id: "history-earlier", authorDisplayName: "responsable-1" },
      { id: "history-later", authorDisplayName: "admin-1" },
    ]);
    expect(detail.comments.map(({ id, authorDisplayName }) => ({
      id,
      authorDisplayName,
    }))).toEqual([
      { id: "comment-earlier", authorDisplayName: "user-1" },
      { id: "comment-later", authorDisplayName: "user-2" },
    ]);
    expect(JSON.stringify(detail)).not.toContain("passwordHash");
    expect(JSON.stringify(detail)).not.toContain("email");
  });

  it("records support exactly once per user", async () => {
    signalements.items.set("report-1", makeSignalement());
    const support = new SupportSignalement(signalements);
    const input = {
      actor: { userId: "user-2", role: "USER" as const },
      signalementId: "report-1",
    };

    await expect(support.execute(input)).resolves.toEqual({
      signalementId: "report-1",
      supportCount: 1,
    });
    await expect(support.execute(input)).rejects.toBeInstanceOf(DejaSoutenuError);
  });

  it("allows only an admin to assign a responsable account", async () => {
    signalements.items.set("report-1", makeSignalement());
    users.items.set("responsable-1", makeUser("responsable-1", "RESPONSABLE"));
    const assign = new AssignResponsable(signalements, users);

    const result = await assign.execute({
      actor: { userId: "admin-1", role: "ADMIN" },
      signalementId: "report-1",
      responsableId: "responsable-1",
    });

    expect(result.assignedResponsableId).toBe("responsable-1");
    await expect(assign.execute({
      actor: { userId: "user-1", role: "USER" },
      signalementId: "report-1",
      responsableId: "responsable-1",
    })).rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
    await expect(assign.execute({
      actor: { userId: "admin-1", role: "ADMIN" },
      signalementId: "report-1",
      responsableId: "missing",
    })).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("saves status changes with their history in one transaction", async () => {
    const report = makeSignalement();
    report.assignToResponsable("responsable-1");
    signalements.items.set("report-1", report);
    const changeStatus = new ChangeSignalementStatus(
      signalements,
      histories,
      clock,
      ids,
      new FakeTransactionManager(),
    );

    const result = await changeStatus.execute({
      actor: { userId: "responsable-1", role: "RESPONSABLE" },
      signalementId: "report-1",
      newStatus: "PRIS_EN_CHARGE",
    });

    expect(result.signalement.status).toBe("PRIS_EN_CHARGE");
    expect(result.history).toMatchObject({
      previousStatus: "NOUVEAU",
      newStatus: "PRIS_EN_CHARGE",
      authorId: "responsable-1",
      changedAt: fixedDate,
    });
    expect(histories.items).toHaveLength(1);
  });

  it("requires the assigned responsable and an intervention when resolving", async () => {
    const report = makeSignalement();
    report.assignToResponsable("responsable-1");
    signalements.items.set("report-1", report);
    const changeStatus = new ChangeSignalementStatus(
      signalements,
      histories,
      clock,
      ids,
      new FakeTransactionManager(),
    );
    const input = {
      actor: { userId: "another-responsable", role: "RESPONSABLE" as const },
      signalementId: "report-1",
      newStatus: "PRIS_EN_CHARGE",
    };

    await expect(changeStatus.execute(input)).rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
    await changeStatus.execute({
      actor: { userId: "responsable-1", role: "RESPONSABLE" },
      signalementId: "report-1",
      newStatus: "PRIS_EN_CHARGE",
    });
    await changeStatus.execute({
      actor: { userId: "responsable-1", role: "RESPONSABLE" },
      signalementId: "report-1",
      newStatus: "EN_COURS",
    });
    await expect(changeStatus.execute({
      actor: { userId: "responsable-1", role: "RESPONSABLE" },
      signalementId: "report-1",
      newStatus: "RESOLU",
    })).rejects.toBeInstanceOf(DescriptionInterventionRequiseError);
    await changeStatus.execute({
      actor: { userId: "responsable-1", role: "RESPONSABLE" },
      signalementId: "report-1",
      newStatus: "RESOLU",
      interventionDescription: "Replaced the lamp.",
    });
    expect(histories.items).toHaveLength(3);
  });

  it("adds comments to existing reports for users", async () => {
    signalements.items.set("report-1", makeSignalement());
    const addComment = new AddComment(signalements, commentaires, clock, ids);

    const result = await addComment.execute({
      actor: { userId: "user-1", role: "USER" },
      signalementId: "report-1",
      content: "I noticed this too.",
    });

    expect(result).toMatchObject({
      signalementId: "report-1",
      authorId: "user-1",
      content: "I noticed this too.",
      createdAt: fixedDate,
    });
    expect(commentaires.items).toHaveLength(1);
  });

  it("limits dashboard statistics to administrators", async () => {
    signalements.items.set("report-1", makeSignalement());
    const dashboard = new GetDashboardStats(signalements);

    await expect(dashboard.execute({ userId: "user-1", role: "USER" }))
      .rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
    await expect(dashboard.execute({ userId: "admin-1", role: "ADMIN" }))
      .resolves.toMatchObject({
        countsByStatus: { NOUVEAU: 1 },
        countsByCategory: [{ category: "Plomberie", count: 1 }],
        averageResolutionTimeMs: 1234,
      });
  });

  it("limits responsable account listings to administrators", async () => {
    users.items.set("responsable-1", makeUser("responsable-1", "RESPONSABLE"));
    users.items.set("user-1", makeUser("user-1", "USER"));
    const getResponsables = new GetResponsables(users);

    await expect(getResponsables.execute({ userId: "user-1", role: "USER" }))
      .rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
    await expect(getResponsables.execute({ userId: "admin-1", role: "ADMIN" }))
      .resolves.toEqual([
        { id: "responsable-1", displayName: "responsable-1" },
      ]);
  });

  it("allows administrators to list users without exposing password data", async () => {
    users.items.set("user-1", makeUser("user-1", "USER"));
    const getUsers = new GetUsersForAdmin(users);

    await expect(getUsers.execute({ userId: "user-1", role: "USER" }))
      .rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
    await expect(getUsers.execute({ userId: "admin-1", role: "ADMIN" }))
      .resolves.toEqual([{
        id: "user-1",
        displayName: "user-1",
        email: "user-1@example.test",
        role: "USER",
      }]);
  });

  it("allows admins to change other users' roles but forbids self changes", async () => {
    users.items.set("admin-1", makeUser("admin-1", "ADMIN"));
    users.items.set("admin-2", makeUser("admin-2", "ADMIN"));
    users.items.set("user-1", makeUser("user-1", "USER"));
    const changeRole = new ChangeUserRole(users);

    await expect(changeRole.execute({
      actor: { userId: "user-1", role: "USER" },
      targetUserId: "user-1",
      newRole: "RESPONSABLE",
    })).rejects.toBeInstanceOf(UnauthorizedDomainOperationError);

    await expect(changeRole.execute({
      actor: { userId: "admin-1", role: "ADMIN" },
      targetUserId: "user-1",
      newRole: "RESPONSABLE",
    })).resolves.toMatchObject({ id: "user-1", role: "RESPONSABLE" });

    await expect(changeRole.execute({
      actor: { userId: "admin-1", role: "ADMIN" },
      targetUserId: "admin-1",
      newRole: "USER",
    })).rejects.toBeInstanceOf(SelfRoleChangeError);
    await expect(users.findById("admin-1")).resolves.toMatchObject({ role: "ADMIN" });

    await expect(changeRole.execute({
      actor: { userId: "admin-2", role: "ADMIN" },
      targetUserId: "admin-2",
      newRole: "RESPONSABLE",
    })).rejects.toBeInstanceOf(SelfRoleChangeError);
  });

  it("registers standard users with a hashed password and prevents role escalation", async () => {
    const register = new RegisterUser(users, new FakePasswordHasher(), clock, ids);

    const result = await register.execute({
      displayName: "New User",
      email: "  USER@example.test ",
      password: "password123",
    });

    expect(result).toMatchObject({
      displayName: "New User",
      email: "user@example.test",
      role: "USER",
    });
    expect(users.items.get(result.id)?.passwordHash).toBe("hashed:password123");
    await expect(register.execute({
      displayName: "Admin",
      email: "admin@example.test",
      password: "password123",
      requestedRole: "ADMIN",
    })).rejects.toBeInstanceOf(UnauthorizedDomainOperationError);
    await expect(register.execute({
      displayName: "Another User",
      email: "user@example.test",
      password: "password123",
    })).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it("authenticates with the password hasher without exposing the hash", async () => {
    users.items.set("user-1", makeUser("user-1", "USER", "user@example.test"));
    const authenticate = new AuthenticateUser(users, new FakePasswordHasher());

    const result = await authenticate.execute({
      email: "USER@example.test",
      password: "password123",
    });

    expect(result).toMatchObject({ id: "user-1", role: "USER" });
    expect(result).not.toHaveProperty("passwordHash");
    await expect(authenticate.execute({
      email: "user@example.test",
      password: "wrong-password",
    })).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects authentication when a user has no legacy password hash", async () => {
    users.items.set("user-1", {
      ...makeUser("user-1", "USER", "user@example.test"),
      passwordHash: null,
    });
    const authenticate = new AuthenticateUser(users, new FakePasswordHasher());

    await expect(authenticate.execute({
      email: "user@example.test",
      password: "password123",
    })).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
