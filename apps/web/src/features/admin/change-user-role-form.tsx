"use client";

import { useActionState } from "react";
import type { UserRole } from "@localimpact/application";
import { Button } from "@localimpact/ui";

import { changeUserRoleAction } from "@/app/admin/actions";
import type { ChangeUserRoleFormState } from "./change-user-role-form-state";

const initialState: ChangeUserRoleFormState = {
  message: "",
  success: false,
};

const roleLabels: Readonly<Record<UserRole, string>> = {
  USER: "Membre",
  RESPONSABLE: "Responsable",
  ADMIN: "Administrateur",
};

export function ChangeUserRoleForm({
  userId,
  currentRole,
}: {
  readonly userId: string;
  readonly currentRole: UserRole;
}) {
  const [state, formAction, pending] = useActionState(
    changeUserRoleAction,
    initialState,
  );
  const roleSelectId = `user-role-${userId}`;

  return (
    <form action={formAction} className="flex min-w-64 flex-col gap-2 sm:flex-row sm:items-start">
      <input name="userId" type="hidden" value={userId} />
      <label className="sr-only" htmlFor={roleSelectId}>
        Rôle du compte
      </label>
      <select
        className="min-h-10 min-w-0 flex-1 border-2 border-slate-900 bg-white px-2 text-sm text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
        defaultValue={currentRole}
        id={roleSelectId}
        name="role"
        required
      >
        {Object.entries(roleLabels).map(([role, label]) => (
          <option key={role} value={role}>
            {label}
          </option>
        ))}
      </select>
      <Button disabled={pending} size="sm" type="submit">
        {pending ? "En cours…" : "Enregistrer"}
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
