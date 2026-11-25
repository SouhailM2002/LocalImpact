"use client";

import { useActionState, useState, type FormEvent } from "react";
import { Button, Input, Textarea } from "@localimpact/ui";

import { createSignalementAction } from "./actions";
import {
  createSignalementSchema,
  getCreateSignalementFieldErrors,
  isUploadedFile,
  MAX_PHOTO_SIZE_BYTES,
  SUPPORTED_PHOTO_TYPES,
  type CreateSignalementField,
  type CreateSignalementFormState,
} from "../../../features/signalements/create-signalement-schema";

const initialState: CreateSignalementFormState = {
  message: "",
  fieldErrors: {},
};

function FieldError({ id, message }: { readonly id: string; readonly message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-sm text-rose-700" id={id}>
      {message}
    </p>
  );
}

export function CreateSignalementForm() {
  const [serverState, formAction, pending] = useActionState(
    createSignalementAction,
    initialState,
  );
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<CreateSignalementField, string>>
  >({});
  const errors = { ...serverState.fieldErrors, ...clientErrors };

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const rawPhoto = formData.get("photo");
    const photo = isUploadedFile(rawPhoto)
      && rawPhoto.name === ""
      && rawPhoto.size === 0
      ? undefined
      : rawPhoto ?? undefined;
    const result = createSignalementSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      location: formData.get("location"),
      photo,
    });

    if (!result.success) {
      event.preventDefault();
      setClientErrors(getCreateSignalementFieldErrors(result.error.issues));
      return;
    }

    setClientErrors({});
  }

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      onSubmit={validateBeforeSubmit}
    >
      {serverState.message && (
        <div
          aria-live="polite"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          {serverState.message}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="title">
          Titre <span className="text-rose-600" aria-hidden="true">*</span>
        </label>
        <Input
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={Boolean(errors.title)}
          autoComplete="off"
          id="title"
          maxLength={120}
          name="title"
          placeholder="Ex. Éclairage en panne dans le couloir"
          required
        />
        <FieldError id="title-error" message={errors.title} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="description">
          Description <span className="text-rose-600" aria-hidden="true">*</span>
        </label>
        <Textarea
          aria-describedby={errors.description ? "description-error" : undefined}
          aria-invalid={Boolean(errors.description)}
          id="description"
          maxLength={3000}
          name="description"
          placeholder="Décrivez le problème et les détails utiles."
          required
          rows={6}
        />
        <FieldError id="description-error" message={errors.description} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="category">
            Catégorie <span className="text-rose-600" aria-hidden="true">*</span>
          </label>
          <Input
            aria-describedby={errors.category ? "category-error" : undefined}
            aria-invalid={Boolean(errors.category)}
            id="category"
            maxLength={80}
            name="category"
            placeholder="Ex. Éclairage"
            required
          />
          <FieldError id="category-error" message={errors.category} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="location">
            Lieu <span className="text-rose-600" aria-hidden="true">*</span>
          </label>
          <Input
            aria-describedby={errors.location ? "location-error" : undefined}
            aria-invalid={Boolean(errors.location)}
            id="location"
            maxLength={160}
            name="location"
            placeholder="Ex. Bâtiment A, 2e étage"
            required
          />
          <FieldError id="location-error" message={errors.location} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="photo">
          Photo <span className="font-normal text-slate-500">(facultative)</span>
        </label>
        <Input
          aria-describedby={errors.photo ? "photo-error" : "photo-help"}
          aria-invalid={Boolean(errors.photo)}
          accept={SUPPORTED_PHOTO_TYPES.join(",")}
          id="photo"
          name="photo"
          type="file"
        />
        <FieldError id="photo-error" message={errors.photo} />
        {!errors.photo && (
          <p className="mt-1.5 text-xs text-slate-500" id="photo-help">
            JPEG, PNG, WebP ou AVIF · 5 Mo maximum.
          </p>
        )}
        <span className="sr-only">
          Taille maximale : {Math.floor(MAX_PHOTO_SIZE_BYTES / 1024 / 1024)} Mo.
        </span>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Les champs marqués d’un astérisque sont obligatoires.
        </p>
        <Button className="w-full sm:w-auto" disabled={pending} type="submit">
          {pending ? "Envoi en cours..." : "Créer le signalement"}
        </Button>
      </div>
      {pending && (
        <p aria-live="polite" className="sr-only" role="status">
          Enregistrement du signalement en cours.
        </p>
      )}
    </form>
  );
}
