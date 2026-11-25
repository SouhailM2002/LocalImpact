export const ACCESSIBILITY_BARRIER_TYPES = [
  "INACCESSIBLE_ENTRY",
  "BLOCKED_PATH",
  "MISSING_RAMP",
  "BROKEN_ELEVATOR",
  "INACCESSIBLE_RESTROOM",
  "MISSING_SIGNAGE",
  "OTHER",
] as const;

export type AccessibilityBarrierType = typeof ACCESSIBILITY_BARRIER_TYPES[number];

export const ACCESSIBILITY_IMPACTS = [
  "MOBILITY",
  "VISION",
  "HEARING",
  "COGNITIVE",
  "OTHER",
] as const;

export type AccessibilityImpact = typeof ACCESSIBILITY_IMPACTS[number];

export const ACCESSIBILITY_URGENCIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type AccessibilityUrgency = typeof ACCESSIBILITY_URGENCIES[number];
