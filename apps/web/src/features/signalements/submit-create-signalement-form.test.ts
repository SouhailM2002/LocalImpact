import {
  PotentialDuplicateSignalementsError,
  type CreateSignalementInput,
  type DuplicateSignalementSuggestion,
  type SignalementDto,
} from "@localimpact/application";
import { describe, expect, it, vi } from "vitest";
import { submitCreateSignalementForm } from "./submit-create-signalement-form";

function makeFormData(confirmPotentialDuplicates = false): FormData {
  const formData = new FormData();
  formData.set("title", "Broken corridor light");
  formData.set("description", "The light in the corridor is broken.");
  formData.set("category", "Electrical");
  formData.set("location", "Building A");
  formData.set("latitude", "36.8065");
  formData.set("longitude", "10.1815");
  if (confirmPotentialDuplicates) {
    formData.set("confirmPotentialDuplicates", "true");
  }
  return formData;
}

const actor = { userId: "user-1", role: "USER" as const };
const suggestion: DuplicateSignalementSuggestion = {
  id: "existing-report",
  title: "Corridor light is broken",
  category: "Electrical",
  location: "Building A",
  status: "NOUVEAU",
  supportCount: 1,
};

describe("report creation duplicate confirmation", () => {
  it("returns similar reports to the form without creating a report", async () => {
    const execute = vi.fn<
      (input: CreateSignalementInput) => Promise<Pick<SignalementDto, "id">>
    >().mockRejectedValue(new PotentialDuplicateSignalementsError([suggestion]));

    const result = await submitCreateSignalementForm(makeFormData(), actor, execute);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.state.message).toContain("similaires");
    expect(result.state.duplicateSuggestions).toEqual([suggestion]);
    expect(execute).toHaveBeenCalledWith(expect.not.objectContaining({
      confirmPotentialDuplicates: true,
    }));
  });

  it("forwards the explicit confirmation to the creation use case", async () => {
    const execute = vi.fn<
      (input: CreateSignalementInput) => Promise<Pick<SignalementDto, "id">>
    >().mockResolvedValue({ id: "created-report" });

    await expect(submitCreateSignalementForm(
      makeFormData(true),
      actor,
      execute,
    )).resolves.toEqual({ ok: true, signalementId: "created-report" });
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({
      confirmPotentialDuplicates: true,
      latitude: 36.8065,
      longitude: 10.1815,
    }));
  });

  it("rejects incomplete accessibility tracking fields before creating a report", async () => {
    const formData = makeFormData();
    formData.set("accessibilityBarrierType", "BLOCKED_PATH");
    const execute = vi.fn<
      (input: CreateSignalementInput) => Promise<Pick<SignalementDto, "id">>
    >().mockResolvedValue({ id: "created-report" });

    const result = await submitCreateSignalementForm(formData, actor, execute);

    expect(result.ok).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });
});
