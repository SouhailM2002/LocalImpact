"use client";

import { useActionState } from "react";
import type { UserDisplayName } from "@localimpact/application";
import { Button } from "@localimpact/ui";

import { assignResponsableAction } from "@/app/admin/actions";
import type { AssignResponsableFormState } from "./assignment-form-state";

const initialState: AssignResponsableFormState = {
  message: "",
  success: false,
};

export function AssignResponsableForm({
  signalementId,
  responsables,
  currentResponsableId,
}: {
  readonly signalementId: string;
  readonly responsables: readonly UserDisplayName[];
  readonly currentResponsableId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    assignResponsableAction,
    initialState,
  );

  if (responsables.length === 0) {
    return (
      <p className="max-w-xs text-sm leading-5 text-amber-900">
        Aucun compte Responsable n’est configuré.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex min-w-64 flex-col gap-2 sm:flex-row">
      <input name="signalementId" type="hidden" value={signalementId} />
      <label className="sr-only" htmlFor={`responsable-${signalementId}`}>
        Responsable à affecter
      </label>
      <select
        className="min-h-10 min-w-0 flex-1 border-2 border-slate-900 bg-white px-2 text-sm text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
        defaultValue={currentResponsableId ?? ""}
        id={`responsable-${signalementId}`}
        name="responsableId"
        required
      >
        <option disabled value="">Choisir un responsable</option>
        {responsables.map((responsable) => (
          <option key={responsable.id} value={responsable.id}>
            {responsable.displayName}
          </option>
        ))}
      </select>
      <Button disabled={pending} size="sm" type="submit">
        {pending ? "En cours…" : "Affecter"}
      </Button>
      {state.message && (
        <p
          aria-live="polite"
          className={state.success ? "text-xs text-emerald-800" : "text-xs text-rose-700"}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
