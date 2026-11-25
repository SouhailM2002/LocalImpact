"use server";

import { revalidatePath } from "next/cache";
import { ApplicationError } from "@localimpact/application";
import {
  DescriptionInterventionRequiseError,
  DomainError,
} from "@localimpact/domain";
import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";
import type { AddCommentFormState } from "@/features/signalements/add-comment-form-state";
import type { ChangeStatusFormState } from "@/features/signalements/change-status-form-state";
import type { SupportFormState } from "@/features/signalements/support-form-state";

const validStatuses = ["PRIS_EN_CHARGE", "EN_COURS", "RESOLU"] as const;

function isValidStatus(value: FormDataEntryValue | null): value is (typeof validStatuses)[number] {
  return typeof value === "string"
    && validStatuses.some((status) => status === value);
}

export async function supportSignalementAction(
  _previousState: SupportFormState,
  formData: FormData,
): Promise<SupportFormState> {
  const user = await getAuthenticatedUser();
  if (user === null) {
    return { message: "Connectez-vous pour soutenir un signalement.", success: false };
  }
  if (user.role !== "USER") {
    return { message: "Seuls les membres peuvent soutenir un signalement.", success: false };
  }

  const signalementId = formData.get("signalementId");
  if (
    typeof signalementId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(signalementId)
  ) {
    return { message: "Sélectionnez un signalement valide.", success: false };
  }

  try {
    await container.supportSignalement.execute({
      actor: { userId: user.id, role: user.role },
      signalementId,
    });
  } catch (error) {
    if (error instanceof ApplicationError || error instanceof DomainError) {
      return { message: error.message, success: false };
    }
    throw error;
  }

  revalidatePath("/reports");
  revalidatePath(`/reports/${encodeURIComponent(signalementId)}`);
  revalidatePath("/", "layout");
  return { message: "Votre soutien a été enregistré.", success: true };
}

export async function addCommentAction(
  _previousState: AddCommentFormState,
  formData: FormData,
): Promise<AddCommentFormState> {
  const user = await getAuthenticatedUser();
  if (user === null) {
    return { message: "Connectez-vous pour commenter un signalement.", success: false };
  }
  if (user.role !== "USER") {
    return { message: "Seuls les membres peuvent commenter un signalement.", success: false };
  }

  const signalementId = formData.get("signalementId");
  const content = formData.get("content");
  if (
    typeof signalementId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(signalementId) ||
    typeof content !== "string"
  ) {
    return { message: "Les informations du commentaire sont invalides.", success: false };
  }
  if (content.trim() === "") {
    return { message: "Le commentaire ne peut pas être vide.", success: false };
  }

  try {
    await container.addComment.execute({
      actor: { userId: user.id, role: user.role },
      signalementId,
      content,
    });
  } catch (error) {
    if (error instanceof ApplicationError || error instanceof DomainError) {
      return { message: error.message, success: false };
    }
    throw error;
  }

  revalidatePath(`/reports/${encodeURIComponent(signalementId)}`);
  return { message: "Votre commentaire a été publié.", success: true };
}

export async function changeSignalementStatusAction(
  _previousState: ChangeStatusFormState,
  formData: FormData,
): Promise<ChangeStatusFormState> {
  const user = await getAuthenticatedUser();
  if (user === null) {
    return { message: "Connectez-vous pour modifier le statut.", success: false };
  }
  if (user.role !== "RESPONSABLE" && user.role !== "ADMIN") {
    return { message: "Cette action est réservée aux responsables et administrateurs.", success: false };
  }

  const signalementId = formData.get("signalementId");
  const newStatus = formData.get("newStatus");
  const interventionDescription = formData.get("interventionDescription");
  if (
    typeof signalementId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(signalementId) ||
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

  revalidatePath("/admin");
  revalidatePath("/responsable");
  revalidatePath("/reports");
  revalidatePath(`/reports/${encodeURIComponent(signalementId)}`);
  return { message: "Le statut du signalement a été mis à jour.", success: true };
}
