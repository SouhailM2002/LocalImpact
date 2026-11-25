CREATE TYPE "AccessibilityBarrierType" AS ENUM (
    'INACCESSIBLE_ENTRY',
    'BLOCKED_PATH',
    'MISSING_RAMP',
    'BROKEN_ELEVATOR',
    'INACCESSIBLE_RESTROOM',
    'MISSING_SIGNAGE',
    'OTHER'
);

CREATE TYPE "AccessibilityImpact" AS ENUM (
    'MOBILITY',
    'VISION',
    'HEARING',
    'COGNITIVE',
    'OTHER'
);

CREATE TYPE "AccessibilityUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "Signalement"
    ADD COLUMN "latitude" DOUBLE PRECISION,
    ADD COLUMN "longitude" DOUBLE PRECISION,
    ADD COLUMN "accessibilityBarrierType" "AccessibilityBarrierType",
    ADD COLUMN "accessibilityImpact" "AccessibilityImpact",
    ADD COLUMN "accessibilityUrgency" "AccessibilityUrgency";

ALTER TABLE "Signalement"
    ADD CONSTRAINT "Signalement_coordinates_pair_check"
        CHECK (
            ("latitude" IS NULL AND "longitude" IS NULL)
            OR ("latitude" IS NOT NULL AND "longitude" IS NOT NULL)
        ),
    ADD CONSTRAINT "Signalement_accessibility_fields_pair_check"
        CHECK (
            ("accessibilityBarrierType" IS NULL
                AND "accessibilityImpact" IS NULL
                AND "accessibilityUrgency" IS NULL)
            OR ("accessibilityBarrierType" IS NOT NULL
                AND "accessibilityImpact" IS NOT NULL
                AND "accessibilityUrgency" IS NOT NULL)
        );

CREATE INDEX "Signalement_accessibilityUrgency_status_idx"
    ON "Signalement"("accessibilityUrgency", "status");
