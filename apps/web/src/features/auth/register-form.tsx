"use client";

import { useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@localimpact/ui";

import { AuthField, AuthMessage } from "./auth-form-components";
import {
  getAuthFieldErrors,
  registrationSchema,
  type AuthField as AuthFieldName,
  type AuthFormState,
} from "./auth-validation";
import { registerAction } from "./actions";

const initialState: AuthFormState = {
  message: "",
  fieldErrors: {},
};

export function RegisterForm() {
  const [serverState, formAction, pending] = useActionState(registerAction, initialState);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<AuthFieldName, string>>
  >({});
  const errors = { ...serverState.fieldErrors, ...clientErrors };

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = registrationSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!result.success) {
      event.preventDefault();
      setClientErrors(getAuthFieldErrors(result.error.issues));
      return;
    }

    setClientErrors({});
  }

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      onSubmit={validateBeforeSubmit}
    >
      <AuthMessage message={serverState.message} />

      <AuthField error={errors.name} id="name" label="Nom complet">
        <Input
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
          autoFocus
          id="name"
          maxLength={80}
          name="name"
          placeholder="Camille Martin"
          required
        />
      </AuthField>

      <AuthField error={errors.email} id="email" label="Adresse e-mail">
        <Input
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          id="email"
          maxLength={254}
          name="email"
          placeholder="vous@exemple.fr"
          required
          type="email"
        />
      </AuthField>

      <AuthField error={errors.password} id="password" label="Mot de passe">
        <Input
          aria-describedby={errors.password ? "password-error" : "password-help"}
          aria-invalid={Boolean(errors.password)}
          autoComplete="new-password"
          id="password"
          maxLength={128}
          minLength={8}
          name="password"
          required
          type="password"
        />
        {!errors.password && (
          <p className="mt-1.5 text-xs text-slate-500" id="password-help">
            8 caractères minimum.
          </p>
        )}
      </AuthField>

      <AuthField
        error={errors.confirmPassword}
        id="confirmPassword"
        label="Confirmer le mot de passe"
      >
        <Input
          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
          aria-invalid={Boolean(errors.confirmPassword)}
          autoComplete="new-password"
          id="confirmPassword"
          maxLength={128}
          name="confirmPassword"
          required
          type="password"
        />
      </AuthField>

      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Création du compte..." : "Créer mon compte"}
      </Button>
      {pending && (
        <p aria-live="polite" className="sr-only" role="status">
          Création du compte en cours.
        </p>
      )}
      <p className="text-center text-sm text-slate-600">
        Vous avez déjà un compte ?{" "}
        <Link
          className="font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-950"
          href="/login"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
