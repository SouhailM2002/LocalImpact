"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";
import type { AssignResponsableFormState } from "@/features/admin/assignment-form-state";
import { ApplicationError } from "@localimpact/application";
import { DomainError } from "@localimpact/domain";

export async function assignResponsableAction(
  _previousState: AssignResponsableFormState,
  formData: FormData,
): Promise<AssignResponsableFormState> {
  const user = await getAuthenticatedUser();
  if (user === null) {
    return { message: "Connectez-vous pour accéder à l’administration.", success: false };
  }
  if (user.role !== "ADMIN") {
    return { message: "Cette action est réservée aux administrateurs.", success: false };
  }

  const signalementId = formData.get("signalementId");
  const responsableId = formData.get("responsableId");
  if (
    typeof signalementId !== "string" ||
    signalementId.trim() === "" ||
    typeof responsableId !== "string" ||
    responsableId.trim() === ""
  ) {
    return { message: "Sélectionnez un responsable.", success: false };
  }

  try {
    await container.assignResponsable.execute({
      actor: { userId: user.id, role: user.role },
      signalementId,
      responsableId,
    });
  } catch (error) {
    if (error instanceof ApplicationError || error instanceof DomainError) {
      return { message: error.message, success: false };
    }
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/reports");
  revalidatePath(`/reports/${encodeURIComponent(signalementId)}`);
  return { message: "Le responsable a été assigné.", success: true };
}
