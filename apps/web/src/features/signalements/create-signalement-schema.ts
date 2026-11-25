import { z } from "zod";
import {
  ACCESSIBILITY_BARRIER_TYPES,
  ACCESSIBILITY_IMPACTS,
  ACCESSIBILITY_URGENCIES,
} from "@localimpact/domain";
import type { DuplicateSignalementSuggestion } from "@localimpact/application";

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_PHOTO_TYPES = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const createSignalementFields = [
  "title",
  "description",
  "category",
  "location",
  "latitude",
  "longitude",
  "accessibilityBarrierType",
  "accessibilityImpact",
  "accessibilityUrgency",
  "photo",
] as const;

export type CreateSignalementField = typeof createSignalementFields[number];

export interface CreateSignalementFormState {
  readonly message: string;
  readonly fieldErrors: Partial<Record<CreateSignalementField, string>>;
  readonly duplicateSuggestions: readonly DuplicateSignalementSuggestion[];
}

function isCreateSignalementField(value: unknown): value is CreateSignalementField {
  return typeof value === "string"
    && createSignalementFields.some((field) => field === value);
}

export function getCreateSignalementFieldErrors(
  issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[],
): Partial<Record<CreateSignalementField, string>> {
  const fieldErrors: Partial<Record<CreateSignalementField, string>> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (isCreateSignalementField(field) && fieldErrors[field] === undefined) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

export function isUploadedFile(value: unknown): value is File {
  return typeof value === "object"
    && value !== null
    && "name" in value
    && typeof value.name === "string"
    && "type" in value
    && typeof value.type === "string"
    && "size" in value
    && typeof value.size === "number"
    && "arrayBuffer" in value
    && typeof value.arrayBuffer === "function";
}

const photoSchema = z.custom<File>(
  isUploadedFile,
  "Sélectionnez un fichier image valide.",
)
  .optional()
  .refine((file) => file === undefined || file.size > 0, {
    message: "Le fichier image est vide.",
  })
  .refine((file) => file === undefined || file.size <= MAX_PHOTO_SIZE_BYTES, {
    message: "La photo ne peut pas dépasser 5 Mo.",
  })
  .refine(
    (file) => file === undefined || SUPPORTED_PHOTO_TYPES.some(
      (type) => type === file.type,
    ),
    { message: "Utilisez une image JPEG, PNG, WebP ou AVIF." },
  );

export const createSignalementSchema = z.object({
  title: z.string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères.")
    .max(120, "Le titre ne peut pas dépasser 120 caractères."),
  description: z.string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères.")
    .max(3000, "La description ne peut pas dépasser 3 000 caractères."),
  category: z.string()
    .trim()
    .min(2, "Saisissez une catégorie.")
    .max(80, "La catégorie ne peut pas dépasser 80 caractères."),
  location: z.string()
    .trim()
    .min(2, "Saisissez un lieu.")
    .max(160, "Le lieu ne peut pas dépasser 160 caractères."),
  latitude: z.string()
    .trim()
    .min(1, "Choisissez un point sur la carte ou saisissez une latitude.")
    .transform(Number)
    .pipe(z.number().finite().min(-90).max(90)),
  longitude: z.string()
    .trim()
    .min(1, "Choisissez un point sur la carte ou saisissez une longitude.")
    .transform(Number)
    .pipe(z.number().finite().min(-180).max(180)),
  accessibilityBarrierType: z.enum(ACCESSIBILITY_BARRIER_TYPES).optional(),
  accessibilityImpact: z.enum(ACCESSIBILITY_IMPACTS).optional(),
  accessibilityUrgency: z.enum(ACCESSIBILITY_URGENCIES).optional(),
  photo: photoSchema,
}).superRefine((fields, context) => {
  const accessibilityFields = [
    ["accessibilityBarrierType", fields.accessibilityBarrierType],
    ["accessibilityImpact", fields.accessibilityImpact],
    ["accessibilityUrgency", fields.accessibilityUrgency],
  ] as const;
  const selectedFields = accessibilityFields.filter(([, value]) => value !== undefined);
  if (selectedFields.length === 0 || selectedFields.length === accessibilityFields.length) {
    return;
  }

  for (const [field, value] of accessibilityFields) {
    if (value === undefined) {
      context.addIssue({
        code: "custom",
        path: [field],
        message: "Renseignez ces trois informations pour suivre un problème d’accessibilité.",
      });
    }
  }
});
