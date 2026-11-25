"use server";

import { revalidatePath } from "next/cache";
import { ApplicationError } from "@localimpact/application";
import {
  DescriptionInterventionRequiseError,
  DomainError,
} from "@localimpact/domain";

import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";
import type { ChangeStatusFormState } from "@/features/responsable/change-status-form-state";

const validStatuses = ["PRIS_EN_CHARGE", "EN_COURS", "RESOLU"] as const;

function isValidStatus(value: FormDataEntryValue | null): value is (typeof validStatuses)[number] {
  return typeof value === "string"
    && validStatuses.some((status) => status === value);
}

export async function changeAssignedReportStatusAction(
  _previousState: ChangeStatusFormState,
  formData: FormData,
): Promise<ChangeStatusFormState> {
  const user = await getAuthenticatedUser();
  if (user === null) {
    return { message: "Connectez-vous pour gérer vos interventions.", success: false };
  }
  if (user.role !== "RESPONSABLE") {
    return { message: "Cette action est réservée aux responsables.", success: false };
  }

  const signalementId = formData.get("signalementId");
  const newStatus = formData.get("newStatus");
  const interventionDescription = formData.get("interventionDescription");
  if (
    typeof signalementId !== "string" ||
    signalementId.trim() === "" ||
    !isValidStatus(newStatus)
  ) {
    return { message: "Les informations du signalement sont invalides.", success: false };
  }
  if (
    interventionDescription !== null &&
    typeof interventionDescription !== "string"
  ) {
    return { message: "La description de l’intervention est invalide.", success: false };
  }
  if (
    typeof interventionDescription === "string" &&
    interventionDescription.length > 3000
  ) {
    return { message: "La description ne peut pas dépasser 3 000 caractères.", success: false };
  }
  if (newStatus === "RESOLU" && !interventionDescription?.trim()) {
    return {
      message: "Décrivez l’intervention avant de marquer le signalement comme résolu.",
      success: false,
    };
  }

  try {
    await container.changeSignalementStatus.execute({
      actor: { userId: user.id, role: user.role },
      signalementId,
      newStatus,
      ...(interventionDescription === null
        ? {}
        : { interventionDescription: interventionDescription.trim() }),
    });
  } catch (error) {
    if (error instanceof DescriptionInterventionRequiseError) {
      return {
        message: "Décrivez l’intervention avant de marquer le signalement comme résolu.",
        success: false,
      };
    }
    if (error instanceof ApplicationError || error instanceof DomainError) {
      return { message: error.message, success: false };
    }
    throw error;
  }

  revalidatePath("/responsable");
  revalidatePath("/reports");
  revalidatePath(`/reports/${encodeURIComponent(signalementId)}`);
  return { message: "Le statut du signalement a été mis à jour.", success: true };
}
