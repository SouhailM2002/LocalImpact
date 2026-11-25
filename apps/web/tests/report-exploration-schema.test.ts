import { describe, expect, it } from "vitest";

import { reportExplorationSchema } from "../src/features/signalements/report-exploration-schema";

describe("reportExplorationSchema", () => {
  it("trims and combines all filters while preserving pagination", () => {
    const result = reportExplorationSchema.safeParse({
      keyword: "  lumière  ",
      category: "  Éclairage ",
      location: " Bâtiment A ",
      status: "EN_COURS",
      page: "3",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        keyword: "lumière",
        category: "Éclairage",
        location: "Bâtiment A",
        status: "EN_COURS",
        page: 3,
      },
    });
  });

  it("rejects unknown statuses, oversized filters, and invalid pages", () => {
    expect(reportExplorationSchema.safeParse({
      status: "ARCHIVE",
    }).success).toBe(false);
    expect(reportExplorationSchema.safeParse({
      keyword: "x".repeat(121),
    }).success).toBe(false);
    expect(reportExplorationSchema.safeParse({
      page: "0",
    }).success).toBe(false);
  });
});
