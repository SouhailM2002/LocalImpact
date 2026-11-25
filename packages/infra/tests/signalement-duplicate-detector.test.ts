import { Signalement, SignalementId } from "@localimpact/domain";
import { describe, expect, it } from "vitest";
import { InMemorySignalementRepository } from "../src/index.js";
import { SignalementDuplicateDetector } from "../src/services/signalement-duplicate-detector.js";

function makeSignalement(
  id: string,
  title: string,
  description: string,
  category = "Éclairage",
  location = "Bâtiment A, étage 2",
): Signalement {
  return Signalement.create({
    id: SignalementId.create(id),
    title,
    description,
    category,
    location,
    creatorId: "user-1",
  });
}

describe("SignalementDuplicateDetector", () => {
  it("suggests reports with similar text in the same category and location", async () => {
    const reports = new InMemorySignalementRepository();
    await reports.create(makeSignalement(
      "similar",
      "Panne d’éclairage du couloir",
      "La lumière ne fonctionne plus dans le couloir.",
    ));
    await reports.create(makeSignalement(
      "different-text",
      "Fenêtre cassée",
      "Le vitrage de la fenêtre est brisé.",
    ));
    await reports.create(makeSignalement(
      "different-category",
      "Panne d’éclairage du couloir",
      "La lumière ne fonctionne plus dans le couloir.",
      "Plomberie",
    ));
    await reports.create(makeSignalement(
      "different-location",
      "Panne d’éclairage du couloir",
      "La lumière ne fonctionne plus dans le couloir.",
      "Éclairage",
      "Bâtiment B",
    ));
    const detector = new SignalementDuplicateDetector(reports);

    await expect(detector.findSimilar({
      title: "Eclairage en panne",
      description: "La lumière du couloir ne fonctionne plus.",
      category: "Éclairage",
      location: "Bâtiment A",
    })).resolves.toMatchObject([
      {
        id: "similar",
        title: "Panne d’éclairage du couloir",
        category: "Éclairage",
        location: "Bâtiment A, étage 2",
      },
    ]);
  });

  it("returns no suggestions when the report text has insufficient overlap", async () => {
    const reports = new InMemorySignalementRepository();
    await reports.create(makeSignalement(
      "unrelated",
      "Fenêtre cassée",
      "Le vitrage de la fenêtre est brisé.",
    ));
    const detector = new SignalementDuplicateDetector(reports);

    await expect(detector.findSimilar({
      title: "Eclairage en panne",
      description: "La lumière du couloir ne fonctionne plus.",
      category: "Éclairage",
      location: "Bâtiment A",
    })).resolves.toEqual([]);
  });
});
