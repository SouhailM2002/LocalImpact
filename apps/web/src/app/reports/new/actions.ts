"use server";

import { redirect } from "next/navigation";
import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";
import type { CreateSignalementFormState } from "@/features/signalements/create-signalement-schema";
import { submitCreateSignalementForm } from "@/features/signalements/submit-create-signalement-form";

export async function createSignalementAction(
  _previousState: CreateSignalementFormState,
  formData: FormData,
): Promise<CreateSignalementFormState> {
  const user = await getAuthenticatedUser();
  const result = await submitCreateSignalementForm(
    formData,
    user === null ? null : { userId: user.id, role: user.role },
    (input) => container.createSignalement.execute(input),
  );

  if (!result.ok) {
    return result.state;
  }

  redirect(`/reports/${encodeURIComponent(result.signalementId)}?created=1`);
}
