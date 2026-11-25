"use client";

import Link from "next/link";
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
import { MapPinPicker } from "../../../features/signalements/map-pin-picker";

const initialState: CreateSignalementFormState = {
  message: "",
  fieldErrors: {},
  duplicateSuggestions: [],
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
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [tracksAccessibility, setTracksAccessibility] = useState(false);
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
      latitude,
      longitude,
      accessibilityBarrierType: tracksAccessibility
        ? formData.get("accessibilityBarrierType")
        : undefined,
      accessibilityImpact: tracksAccessibility
        ? formData.get("accessibilityImpact")
        : undefined,
      accessibilityUrgency: tracksAccessibility
        ? formData.get("accessibilityUrgency")
        : undefined,
      photo,
    });

    if (!result.success) {
      event.preventDefault();
      setClientErrors(getCreateSignalementFieldErrors(result.error.issues));
      return;
    }

    setClientErrors({});
  }

  function updateCoordinates(position: { readonly latitude: number; readonly longitude: number }) {
    setLatitude(position.latitude.toFixed(6));
    setLongitude(position.longitude.toFixed(6));
    setClientErrors((current) => ({
      ...current,
      latitude: undefined,
      longitude: undefined,
    }));
  }

  function handleCoordinateChange(
    field: "latitude" | "longitude",
    value: string,
  ) {
    if (field === "latitude") {
      setLatitude(value);
    } else {
      setLongitude(value);
    }
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
          className="border-2 border-[#B42318] bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {serverState.message}
        </div>
      )}

      {serverState.duplicateSuggestions.length > 0 && (
        <section
          aria-labelledby="duplicate-suggestions-title"
          className="border-2 border-amber-700 bg-amber-50 p-4 text-amber-950 sm:p-5"
          role="alert"
        >
          <h2 className="font-black" id="duplicate-suggestions-title">
            Des signalements similaires existent déjà
          </h2>
          <p className="mt-1 text-sm leading-6">
            Consultez-les avant de continuer. Si votre problème est différent,
            vous pouvez confirmer la création ci-dessous.
          </p>
          <ul className="mt-3 space-y-2">
            {serverState.duplicateSuggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <Link
                  className="font-bold underline underline-offset-4 hover:text-amber-800"
                  href={`/reports/${encodeURIComponent(suggestion.id)}`}
                >
                  {suggestion.title}
                </Link>
                <span className="ml-2 text-sm text-amber-900">
                  {suggestion.category} · {suggestion.location}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-900" htmlFor="title">
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
        <label className="mb-2 block text-sm font-bold text-slate-900" htmlFor="description">
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
          <label className="mb-2 block text-sm font-bold text-slate-900" htmlFor="category">
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
          <label className="mb-2 block text-sm font-bold text-slate-900" htmlFor="location">
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

      <section aria-labelledby="map-location-heading" className="space-y-3 border-t-2 border-slate-900 pt-5">
        <div>
          <h2 className="text-lg font-black text-slate-950" id="map-location-heading">
            Position sur la carte
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Cliquez sur la carte ou saisissez les coordonnées. Elles serviront à placer le signalement.
          </p>
        </div>
        <MapPinPicker
          onSelect={updateCoordinates}
          selectedPosition={
            latitude !== "" && longitude !== ""
              ? { latitude: Number(latitude), longitude: Number(longitude) }
              : null
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="latitude">
              Latitude
            </label>
            <Input
              aria-describedby={errors.latitude ? "latitude-error" : undefined}
              aria-invalid={Boolean(errors.latitude)}
              id="latitude"
              max="90"
              min="-90"
              name="latitude"
              onChange={(event) => handleCoordinateChange("latitude", event.currentTarget.value)}
              required
              step="any"
              type="number"
              value={latitude}
            />
            <FieldError id="latitude-error" message={errors.latitude} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="longitude">
              Longitude
            </label>
            <Input
              aria-describedby={errors.longitude ? "longitude-error" : undefined}
              aria-invalid={Boolean(errors.longitude)}
              id="longitude"
              max="180"
              min="-180"
              name="longitude"
              onChange={(event) => handleCoordinateChange("longitude", event.currentTarget.value)}
              required
              step="any"
              type="number"
              value={longitude}
            />
            <FieldError id="longitude-error" message={errors.longitude} />
          </div>
        </div>
      </section>

      <section aria-labelledby="accessibility-heading" className="space-y-4 border-t-2 border-slate-900 pt-5">
        <div>
          <h2 className="text-lg font-black text-slate-950" id="accessibility-heading">
            Suivi de l’accessibilité
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Ajoutez des informations structurées pour aider à prioriser les obstacles d’accessibilité.
            Le statut de suivi reste celui du signalement.
          </p>
        </div>
        <label className="flex items-start gap-3 text-sm font-semibold text-slate-800">
          <input
            checked={tracksAccessibility}
            className="mt-1 size-4 accent-[#1F4FD8]"
            onChange={(event) => setTracksAccessibility(event.currentTarget.checked)}
            type="checkbox"
          />
          Ce signalement concerne un obstacle d’accessibilité
        </label>
        {tracksAccessibility && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="accessibilityBarrierType">
                Type d’obstacle
              </label>
              <select
                aria-describedby={errors.accessibilityBarrierType ? "accessibility-barrier-error" : undefined}
                aria-invalid={Boolean(errors.accessibilityBarrierType)}
                className="min-h-11 w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
                id="accessibilityBarrierType"
                name="accessibilityBarrierType"
                required
              >
                <option value="">Sélectionnez un obstacle</option>
                <option value="INACCESSIBLE_ENTRY">Entrée inaccessible</option>
                <option value="BLOCKED_PATH">Chemin obstrué</option>
                <option value="MISSING_RAMP">Rampe manquante</option>
                <option value="BROKEN_ELEVATOR">Ascenseur en panne</option>
                <option value="INACCESSIBLE_RESTROOM">Toilettes inaccessibles</option>
                <option value="MISSING_SIGNAGE">Signalétique manquante</option>
                <option value="OTHER">Autre obstacle</option>
              </select>
              <FieldError id="accessibility-barrier-error" message={errors.accessibilityBarrierType} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="accessibilityImpact">
                Impact
              </label>
              <select
                aria-describedby={errors.accessibilityImpact ? "accessibility-impact-error" : undefined}
                aria-invalid={Boolean(errors.accessibilityImpact)}
                className="min-h-11 w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
                id="accessibilityImpact"
                name="accessibilityImpact"
                required
              >
                <option value="">Sélectionnez un impact</option>
                <option value="MOBILITY">Mobilité</option>
                <option value="VISION">Vision</option>
                <option value="HEARING">Audition</option>
                <option value="COGNITIVE">Compréhension et orientation</option>
                <option value="OTHER">Autre impact</option>
              </select>
              <FieldError id="accessibility-impact-error" message={errors.accessibilityImpact} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="accessibilityUrgency">
                Urgence
              </label>
              <select
                aria-describedby={errors.accessibilityUrgency ? "accessibility-urgency-error" : undefined}
                aria-invalid={Boolean(errors.accessibilityUrgency)}
                className="min-h-11 w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
                id="accessibilityUrgency"
                name="accessibilityUrgency"
                required
              >
                <option value="">Sélectionnez l’urgence</option>
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Modérée</option>
                <option value="HIGH">Élevée</option>
              </select>
              <FieldError id="accessibility-urgency-error" message={errors.accessibilityUrgency} />
            </div>
          </div>
        )}
      </section>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-900" htmlFor="photo">
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

      <div className="flex flex-col-reverse gap-3 border-t-2 border-slate-900 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Les champs marqués d’un astérisque sont obligatoires.
        </p>
        <Button className="w-full sm:w-auto" disabled={pending} type="submit">
          {pending ? "Envoi en cours..." : "Créer le signalement"}
        </Button>
        {serverState.duplicateSuggestions.length > 0 && (
          <Button
            className="w-full sm:w-auto"
            disabled={pending}
            name="confirmPotentialDuplicates"
            type="submit"
            value="true"
            variant="secondary"
          >
            Créer quand même
          </Button>
        )}
      </div>
      {pending && (
        <p aria-live="polite" className="sr-only" role="status">
          Enregistrement du signalement en cours.
        </p>
      )}
    </form>
  );
}
