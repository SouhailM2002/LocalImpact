"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";
import type { AssignResponsableFormState } from "@/features/admin/assignment-form-state";
import type { ChangeUserRoleFormState } from "@/features/admin/change-user-role-form-state";
import { ApplicationError } from "@localimpact/application";
import { DomainError } from "@localimpact/domain";

const userRoles = ["USER", "RESPONSABLE", "ADMIN"] as const;

function isUserRole(value: FormDataEntryValue | null): value is (typeof userRoles)[number] {
  return typeof value === "string" && userRoles.some((role) => role === value);
}

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

export async function changeUserRoleAction(
  _previousState: ChangeUserRoleFormState,
  formData: FormData,
): Promise<ChangeUserRoleFormState> {
  const user = await getAuthenticatedUser();
  if (user === null) {
    return { message: "Connectez-vous pour gérer les rôles.", success: false };
  }
  if (user.role !== "ADMIN") {
    return { message: "Cette action est réservée aux administrateurs.", success: false };
  }

  const targetUserId = formData.get("userId");
  const newRole = formData.get("role");
  if (
    typeof targetUserId !== "string" ||
    targetUserId.trim() === "" ||
    !isUserRole(newRole)
  ) {
    return { message: "Sélectionnez un compte et un rôle valides.", success: false };
  }

  try {
    await container.changeUserRole.execute({
      actor: { userId: user.id, role: user.role },
      targetUserId,
      newRole,
    });
  } catch (error) {
    if (error instanceof ApplicationError || error instanceof DomainError) {
      return { message: error.message, success: false };
    }
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/reports");
  revalidatePath("/responsable");

  if (targetUserId === user.id && newRole !== "ADMIN") {
    redirect("/reports");
  }

  return { message: "Le rôle du compte a été mis à jour.", success: true };
}
