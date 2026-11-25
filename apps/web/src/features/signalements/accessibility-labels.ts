import type {
  AccessibilityBarrierType,
  AccessibilityImpact,
  AccessibilityUrgency,
  StatutValue,
} from "@localimpact/domain";

const barrierLabels: Record<AccessibilityBarrierType, string> = {
  INACCESSIBLE_ENTRY: "Entrée inaccessible",
  BLOCKED_PATH: "Chemin obstrué",
  MISSING_RAMP: "Rampe manquante",
  BROKEN_ELEVATOR: "Ascenseur en panne",
  INACCESSIBLE_RESTROOM: "Toilettes inaccessibles",
  MISSING_SIGNAGE: "Signalétique manquante",
  OTHER: "Autre obstacle",
};

const impactLabels: Record<AccessibilityImpact, string> = {
  MOBILITY: "Mobilité",
  VISION: "Vision",
  HEARING: "Audition",
  COGNITIVE: "Compréhension et orientation",
  OTHER: "Autre impact",
};

const urgencyLabels: Record<AccessibilityUrgency, string> = {
  LOW: "Faible",
  MEDIUM: "Modérée",
  HIGH: "Élevée",
};

export const reportStatusLabels: Record<StatutValue, string> = {
  NOUVEAU: "Nouveau",
  PRIS_EN_CHARGE: "Pris en charge",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
};

export function getAccessibilityBarrierLabel(value: AccessibilityBarrierType): string {
  return barrierLabels[value];
}

export function getAccessibilityImpactLabel(value: AccessibilityImpact): string {
  return impactLabels[value];
}

export function getAccessibilityUrgencyLabel(value: AccessibilityUrgency): string {
  return urgencyLabels[value];
}
