"use client";

import { useActionState } from "react";
import type { StatutValue } from "@localimpact/domain";
import { Button, Textarea } from "@localimpact/ui";

import { changeAssignedReportStatusAction } from "@/app/responsable/actions";
import type { ChangeStatusFormState } from "./change-status-form-state";

const initialState: ChangeStatusFormState = {
  message: "",
  success: false,
};

const nextStatuses: Readonly<Partial<Record<StatutValue, StatutValue>>> = {
  NOUVEAU: "PRIS_EN_CHARGE",
  PRIS_EN_CHARGE: "EN_COURS",
  EN_COURS: "RESOLU",
};

const statusLabels: Readonly<Record<StatutValue, string>> = {
  NOUVEAU: "Nouveau",
  PRIS_EN_CHARGE: "Pris en charge",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
};

export function ChangeStatusForm({
  signalementId,
  currentStatus,
}: {
  readonly signalementId: string;
  readonly currentStatus: StatutValue;
}) {
  const [state, formAction, pending] = useActionState(
    changeAssignedReportStatusAction,
    initialState,
  );
  const nextStatus = nextStatuses[currentStatus];

  if (nextStatus === undefined) {
    return (
      <p className="text-sm font-semibold text-emerald-800">
        Ce signalement est résolu.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 border-t border-slate-200 pt-4">
      <input name="signalementId" type="hidden" value={signalementId} />
      <input name="newStatus" type="hidden" value={nextStatus} />
      {nextStatus === "RESOLU" && (
        <div>
          <label
            className="mb-1.5 block text-sm font-bold text-slate-900"
            htmlFor={`intervention-${signalementId}`}
          >
            Description de l’intervention <span aria-hidden="true" className="text-rose-600">*</span>
          </label>
          <Textarea
            id={`intervention-${signalementId}`}
            maxLength={3000}
            name="interventionDescription"
            placeholder="Décrivez les travaux effectués et le résultat."
            required
            rows={3}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? "Mise à jour…" : `Passer à « ${statusLabels[nextStatus]} »`}
        </Button>
        {state.message && (
          <p
            aria-live="polite"
            className={state.success ? "text-sm text-emerald-800" : "text-sm text-rose-700"}
            role={state.success ? "status" : "alert"}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
