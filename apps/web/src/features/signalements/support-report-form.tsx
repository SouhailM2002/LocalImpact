"use client";

import { useActionState } from "react";
import { Button } from "@localimpact/ui";

import { supportSignalementAction } from "@/app/reports/actions";
import type { SupportFormState } from "./support-form-state";

const initialState: SupportFormState = {
  message: "",
  success: false,
};

export function SupportReportForm({
  signalementId,
  alreadySupported,
}: {
  readonly signalementId: string;
  readonly alreadySupported: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    supportSignalementAction,
    initialState,
  );

  if (alreadySupported || state.success) {
    return (
      <p className="mt-2 text-sm font-semibold text-emerald-800" role="status">
        {state.success ? state.message : "Vous soutenez déjà ce signalement."}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input name="signalementId" type="hidden" value={signalementId} />
      <Button disabled={pending} size="sm" type="submit">
        {pending ? "Enregistrement…" : "Soutenir ce signalement"}
      </Button>
      {state.message && (
        <p
          aria-live="polite"
          className="text-sm text-rose-700"
          role="alert"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
