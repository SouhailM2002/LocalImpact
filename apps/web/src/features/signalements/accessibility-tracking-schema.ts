import { z } from "zod";
import {
  ACCESSIBILITY_IMPACTS,
  ACCESSIBILITY_URGENCIES,
  STATUT_VALUES,
} from "@localimpact/domain";

const optionalImpact = z.union([
  z.enum(ACCESSIBILITY_IMPACTS),
  z.literal(""),
]).optional().transform((value) => value === "" ? undefined : value);

const optionalUrgency = z.union([
  z.enum(ACCESSIBILITY_URGENCIES),
  z.literal(""),
]).optional().transform((value) => value === "" ? undefined : value);

const optionalStatus = z.union([
  z.enum(STATUT_VALUES),
  z.literal(""),
]).optional().transform((value) => value === "" ? undefined : value);

export const accessibilityTrackingSchema = z.object({
  impact: optionalImpact,
  urgency: optionalUrgency,
  status: optionalStatus,
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  view: z.enum(["list", "map"]).optional().default("list"),
});

export type AccessibilityTrackingFilters = z.output<typeof accessibilityTrackingSchema>;
