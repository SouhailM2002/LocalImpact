import { describe, expect, it, vi } from "vitest";

import type { CreateSignalementInput } from "@localimpact/application";
import { submitCreateSignalementForm } from "../src/features/signalements/submit-create-signalement-form";

const userActor = { userId: "session-user", role: "USER" as const };
const pngSignature = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function validFormData(photo?: File): FormData {
  const formData = new FormData();
  formData.set("title", "Broken hallway light");
  formData.set("description", "The light is not working on the second floor.");
  formData.set("category", "Lighting");
  formData.set("location", "Building A, floor 2");
  formData.set("latitude", "36.8065");
  formData.set("longitude", "10.1815");
  if (photo !== undefined) {
    formData.set("photo", photo);
  }
  return formData;
}

describe("submitCreateSignalementForm", () => {
  it("creates a report with the verified actor and an optional photo", async () => {
    const formData = validFormData(
      new File([pngSignature], "hallway.png", { type: "image/png" }),
    );
    formData.set("creatorId", "attacker-controlled-id");

    let receivedInput: CreateSignalementInput | undefined;
    const result = await submitCreateSignalementForm(
      formData,
      userActor,
      (input) => {
        receivedInput = input;
        return Promise.resolve({ id: "report-123" });
      },
    );

    expect(result).toEqual({ ok: true, signalementId: "report-123" });
    expect(receivedInput).toMatchObject({
      actor: userActor,
      title: "Broken hallway light",
      latitude: 36.8065,
      longitude: 10.1815,
      photo: {
        fileName: "hallway.png",
        contentType: "image/png",
        content: pngSignature,
      },
    });
    expect(receivedInput).not.toHaveProperty("creatorId");
  });

  it("treats the browser's empty file control value as no photo", async () => {
    let receivedInput: CreateSignalementInput | undefined;
    const result = await submitCreateSignalementForm(
      validFormData(new File([], "undefined", { type: "application/octet-stream" })),
      userActor,
      (input) => {
        receivedInput = input;
        return Promise.resolve({ id: "report-without-photo" });
      },
    );

    expect(result).toEqual({ ok: true, signalementId: "report-without-photo" });
    expect(receivedInput).not.toHaveProperty("photo");
  });

  it("rejects unauthenticated, unauthorized, and invalid submissions before creation", async () => {
    const execute = vi.fn(() => Promise.resolve({ id: "should-not-be-created" }));

    const unauthenticated = await submitCreateSignalementForm(
      validFormData(),
      null,
      execute,
    );
    expect(unauthenticated).toMatchObject({
      ok: false,
      state: { message: "Connectez-vous pour créer un signalement." },
    });

    const responsible = await submitCreateSignalementForm(
      validFormData(),
      { userId: "responsable-1", role: "RESPONSABLE" },
      execute,
    );
    expect(responsible).toMatchObject({ ok: false });

    const invalid = validFormData();
    invalid.set("title", " ");
    const validationFailure = await submitCreateSignalementForm(
      invalid,
      userActor,
      execute,
    );
    if (validationFailure.ok) {
      throw new Error("Invalid input unexpectedly created a report.");
    }
    expect(validationFailure.state.fieldErrors.title).toBeDefined();
    expect(execute).not.toHaveBeenCalled();
  });

  it("rejects files whose bytes do not match the claimed image type", async () => {
    const result = await submitCreateSignalementForm(
      validFormData(new File(["not an image"], "fake.png", { type: "image/png" })),
      userActor,
      vi.fn(() => Promise.resolve({ id: "should-not-be-created" })),
    );

    if (result.ok) {
      throw new Error("An invalid image unexpectedly created a report.");
    }
    expect(result.state.fieldErrors.photo).toBeDefined();
  });
});
