import { describe, expect, it } from "vitest";

import {
  HistoriqueStatut,
  InterventionRequiredError,
  InvalidStatusTransitionError,
  SignalementId,
  Statut,
} from "../src/index.js";

describe("HistoriqueStatut", () => {
  it("requires an intervention description for a resolved status", () => {
    expect(() =>
      HistoriqueStatut.create({
        id: "history-1",
        signalementId: SignalementId.create("signalement-1"),
        previousStatus: Statut.EN_COURS,
        newStatus: Statut.RESOLU,
        authorId: "responsable-1",
      }),
    ).toThrow(InterventionRequiredError);
  });

  it("rejects history entries for invalid transitions", () => {
    expect(() =>
      HistoriqueStatut.create({
        id: "history-1",
        signalementId: SignalementId.create("signalement-1"),
        previousStatus: Statut.NOUVEAU,
        newStatus: Statut.EN_COURS,
        authorId: "responsable-1",
      }),
    ).toThrow(InvalidStatusTransitionError);
  });
});
