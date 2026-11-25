import { describe, expect, it } from "vitest";

import {
  DejaSoutenuError,
  DescriptionInterventionRequiseError,
  InvalidSignalementError,
  InvalidStatusTransitionError,
  Signalement,
  SignalementId,
  Statut,
  UnauthorizedDomainOperationError,
} from "../src/index.js";
import type { CreateSignalementInput } from "../src/index.js";

const createdAt = new Date("2026-01-02T03:04:05.000Z");

const validInput: CreateSignalementInput = {
  id: SignalementId.create("signalement-1"),
  title: "Broken light",
  description: "The light in the corridor is broken.",
  category: "Electrical",
  location: "Building A, floor 2",
  createdAt,
  creatorId: "user-1",
};

function createSignalement(overrides: Partial<CreateSignalementInput> = {}): Signalement {
  return Signalement.create({ ...validInput, ...overrides });
}

describe("Signalement", () => {
  it("starts with the initial status and no supports", () => {
    const report = createSignalement();

    expect(report.status).toBe(Statut.NOUVEAU);
    expect(report.supportCount).toBe(0);
    expect(report.createdAt).toEqual(createdAt);
    expect(report.assignedResponsableId).toBeUndefined();
  });

  it("reconstitutes persisted status, support count, and intervention description", () => {
    const report = Signalement.reconstitute({
      ...validInput,
      status: Statut.EN_COURS,
      supportCount: 4,
      interventionDescription: "Initial repair attempted.",
    });

    expect(report.status).toBe(Statut.EN_COURS);
    expect(report.supportCount).toBe(4);
    expect(report.interventionDescription).toBe("Initial repair attempted.");
    expect(() => Signalement.reconstitute({
      ...validInput,
      status: Statut.NOUVEAU,
      supportCount: -1,
    })).toThrow(InvalidSignalementError);
  });

  it.each(["title", "description", "category", "location"] as const)(
    "rejects a blank %s",
    (field) => {
      const input = { ...validInput };
      input[field] = "  ";

      expect(() => Signalement.create(input)).toThrow(InvalidSignalementError);
    },
  );

  it("normalizes text and permits an optional photo URL and assignment", () => {
    const report = createSignalement({
      title: "  Broken light  ",
      photoUrl: " https://example.test/photo.jpg ",
      assignedResponsableId: " responsable-1 ",
    });

    expect(report.title).toBe("Broken light");
    expect(report.photoUrl).toBe("https://example.test/photo.jpg");
    expect(report.assignedResponsableId).toBe("responsable-1");
  });

  it("stores coordinates and complete accessibility tracking fields", () => {
    const report = createSignalement({
      latitude: 36.8065,
      longitude: 10.1815,
      accessibilityBarrierType: "BLOCKED_PATH",
      accessibilityImpact: "MOBILITY",
      accessibilityUrgency: "HIGH",
    });

    expect(report).toMatchObject({
      latitude: 36.8065,
      longitude: 10.1815,
      accessibilityBarrierType: "BLOCKED_PATH",
      accessibilityImpact: "MOBILITY",
      accessibilityUrgency: "HIGH",
    });
  });

  it("rejects incomplete or out-of-range coordinates and accessibility metadata", () => {
    expect(() => createSignalement({ latitude: 36.8 })).toThrow(InvalidSignalementError);
    expect(() => createSignalement({ latitude: 91, longitude: 10 })).toThrow(InvalidSignalementError);
    expect(() => createSignalement({
      accessibilityBarrierType: "BLOCKED_PATH",
    })).toThrow(InvalidSignalementError);
  });

  it("does not allow a user to support the same report twice", () => {
    const report = createSignalement();

    expect(report.supportBy("user-2")).toBe(1);
    expect(() => report.supportBy("user-2")).toThrow(DejaSoutenuError);
    expect(report.supportCount).toBe(1);
    expect(report.supportBy("user-3")).toBe(2);
  });

  it("assigns the report to a non-empty responsable ID", () => {
    const report = createSignalement();

    report.assignToResponsable("responsable-1");

    expect(report.assignedResponsableId).toBe("responsable-1");
    expect(() => report.assignToResponsable(" ")).toThrow(InvalidSignalementError);
  });

  it("records each valid status transition with author and timestamp", () => {
    const report = createSignalement();
    const changedAt = new Date("2026-02-03T04:05:06.000Z");

    const history = report.transitionTo({
      historyId: "history-1",
      newStatus: Statut.PRIS_EN_CHARGE,
      authorId: "responsable-1",
      authorRole: "RESPONSABLE",
      changedAt,
    });

    expect(report.status).toBe(Statut.PRIS_EN_CHARGE);
    expect(history.signalementId).toBe(report.id);
    expect(history.previousStatus).toBe(Statut.NOUVEAU);
    expect(history.newStatus).toBe(Statut.PRIS_EN_CHARGE);
    expect(history.authorId).toBe("responsable-1");
    expect(history.changedAt).toEqual(changedAt);
  });

  it("rejects skipped or repeated status transitions without changing state", () => {
    const report = createSignalement();

    expect(() =>
      report.transitionTo({
        historyId: "history-1",
        newStatus: Statut.EN_COURS,
        authorId: "responsable-1",
        authorRole: "RESPONSABLE",
      }),
    ).toThrow(InvalidStatusTransitionError);
    expect(() => report.transitionTo({
      historyId: "history-2",
      newStatus: Statut.NOUVEAU,
      authorId: "responsable-1",
      authorRole: "RESPONSABLE",
    })).toThrow(InvalidStatusTransitionError);
    expect(report.status).toBe(Statut.NOUVEAU);
  });

  it("rejects status changes by ordinary users", () => {
    const report = createSignalement();

    expect(() =>
      report.transitionTo({
        historyId: "history-1",
        newStatus: Statut.PRIS_EN_CHARGE,
        authorId: "user-1",
        authorRole: "USER",
      }),
    ).toThrow(UnauthorizedDomainOperationError);
    expect(report.status).toBe(Statut.NOUVEAU);
  });

  it("allows administrators to change status", () => {
    const report = createSignalement();

    report.transitionTo({
      historyId: "history-1",
      newStatus: Statut.PRIS_EN_CHARGE,
      authorId: "admin-1",
      authorRole: "ADMIN",
    });

    expect(report.status).toBe(Statut.PRIS_EN_CHARGE);
  });

  it("requires a non-empty intervention description before resolution", () => {
    const report = createSignalement();
    report.transitionTo({
      historyId: "history-1",
      newStatus: Statut.PRIS_EN_CHARGE,
      authorId: "responsable-1",
      authorRole: "RESPONSABLE",
    });
    report.transitionTo({
      historyId: "history-2",
      newStatus: Statut.EN_COURS,
      authorId: "responsable-1",
      authorRole: "RESPONSABLE",
    });

    expect(() =>
      report.transitionTo({
        historyId: "history-3",
        newStatus: Statut.RESOLU,
        authorId: "responsable-1",
        authorRole: "RESPONSABLE",
        interventionDescription: "  ",
      }),
    ).toThrow(DescriptionInterventionRequiseError);
    expect(report.status).toBe(Statut.EN_COURS);

    const history = report.transitionTo({
      historyId: "history-4",
      newStatus: Statut.RESOLU,
      authorId: "responsable-1",
      authorRole: "RESPONSABLE",
      interventionDescription: "Replaced the faulty light.",
    });

    expect(report.status).toBe(Statut.RESOLU);
    expect(history.interventionDescription).toBe("Replaced the faulty light.");
    expect(report.interventionDescription).toBe("Replaced the faulty light.");
  });

  it("returns defensive copies of creation dates", () => {
    const report = createSignalement();
    const returnedDate = report.createdAt;
    returnedDate.setFullYear(2000);

    expect(report.createdAt).toEqual(createdAt);
  });
});
