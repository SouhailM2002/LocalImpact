import type {
  ActorContext,
  CreateSignalementInput,
  SignalementDto,
} from "@localimpact/application";
import {
  ApplicationError,
  PotentialDuplicateSignalementsError,
} from "@localimpact/application";
import { DomainError } from "@localimpact/domain";

import {
  createSignalementSchema,
  getCreateSignalementFieldErrors,
  isUploadedFile,
  type CreateSignalementField,
  type CreateSignalementFormState,
} from "./create-signalement-schema";

type CreateSignalementExecutor = (
  input: CreateSignalementInput,
) => Promise<Pick<SignalementDto, "id">>;

export type CreateSignalementSubmission =
  | { readonly ok: true; readonly signalementId: string }
  | { readonly ok: false; readonly state: CreateSignalementFormState };

function failed(
  message: string,
  fieldErrors: Partial<Record<CreateSignalementField, string>> = {},
  duplicateSuggestions: CreateSignalementFormState["duplicateSuggestions"] = [],
): CreateSignalementSubmission {
  return { ok: false, state: { message, fieldErrors, duplicateSuggestions } };
}

function optionalPhoto(value: FormDataEntryValue | null): unknown {
  if (
    value === null ||
    (isUploadedFile(value) && value.name === "" && value.size === 0)
  ) {
    return undefined;
  }
  return value;
}

function optionalField(value: FormDataEntryValue | null): unknown {
  return value === null || value === "" ? undefined : value;
}

function isSupportedImage(contentType: string, content: Uint8Array): boolean {
  if (contentType === "image/jpeg") {
    return content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff;
  }

  if (contentType === "image/png") {
    return content.length >= 8
      && content[0] === 0x89
      && content[1] === 0x50
      && content[2] === 0x4e
      && content[3] === 0x47
      && content[4] === 0x0d
      && content[5] === 0x0a
      && content[6] === 0x1a
      && content[7] === 0x0a;
  }

  if (contentType === "image/webp") {
    return content.length >= 12
      && String.fromCharCode(...content.subarray(0, 4)) === "RIFF"
      && String.fromCharCode(...content.subarray(8, 12)) === "WEBP";
  }

  if (contentType === "image/avif") {
    const brand = String.fromCharCode(...content.subarray(8, 12));
    return content.length >= 12 && brand === "avif";
  }

  return false;
}

export async function submitCreateSignalementForm(
  formData: FormData,
  actor: ActorContext | null,
  execute: CreateSignalementExecutor,
): Promise<CreateSignalementSubmission> {
  if (actor === null) {
    return failed("Connectez-vous pour créer un signalement.");
  }

  if (actor.role !== "USER") {
    return failed("Seuls les membres peuvent créer un signalement.");
  }

  const parsed = createSignalementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    location: formData.get("location"),
    latitude: optionalField(formData.get("latitude")) ?? "",
    longitude: optionalField(formData.get("longitude")) ?? "",
    accessibilityBarrierType: optionalField(formData.get("accessibilityBarrierType")),
    accessibilityImpact: optionalField(formData.get("accessibilityImpact")),
    accessibilityUrgency: optionalField(formData.get("accessibilityUrgency")),
    photo: optionalPhoto(formData.get("photo")),
  });

  if (!parsed.success) {
    return failed(
      "Vérifiez les champs signalés avant de continuer.",
      getCreateSignalementFieldErrors(parsed.error.issues),
    );
  }

  const { photo, ...fields } = parsed.data;
  let photoUpload: CreateSignalementInput["photo"];

  if (photo !== undefined) {
    const content = new Uint8Array(await photo.arrayBuffer());
    if (!isSupportedImage(photo.type, content)) {
      return failed(
        "Le contenu de la photo ne correspond pas à son format.",
        { photo: "Choisissez une image JPEG, PNG, WebP ou AVIF valide." },
      );
    }

    photoUpload = {
      fileName: photo.name,
      contentType: photo.type,
      content,
    };
  }

  const input: CreateSignalementInput = {
    actor,
    ...fields,
    ...(formData.get("confirmPotentialDuplicates") === "true"
      ? { confirmPotentialDuplicates: true }
      : {}),
    ...(photoUpload === undefined ? {} : { photo: photoUpload }),
  };

  try {
    const signalement = await execute(input);
    return { ok: true, signalementId: signalement.id };
  } catch (error) {
    if (error instanceof PotentialDuplicateSignalementsError) {
      return failed(error.message, {}, error.suggestions);
    }
    if (error instanceof ApplicationError || error instanceof DomainError) {
      return failed(error.message);
    }
    throw error;
  }
}
