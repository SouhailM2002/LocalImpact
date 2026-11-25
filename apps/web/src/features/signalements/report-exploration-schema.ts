import { z } from "zod";

const optionalFilter = (maximumLength: number) =>
  z.string()
    .trim()
    .max(maximumLength)
    .optional()
    .transform((value) => value === "" ? undefined : value);

export const reportExplorationSchema = z.object({
  keyword: optionalFilter(120),
  category: optionalFilter(80),
  location: optionalFilter(160),
  status: z.union([
    z.enum(["NOUVEAU", "PRIS_EN_CHARGE", "EN_COURS", "RESOLU"]),
    z.literal(""),
  ]).optional().transform((value) => value === "" ? undefined : value),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
});

export type ReportExplorationFilters = z.output<typeof reportExplorationSchema>;
