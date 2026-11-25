"use client";

import { useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@localimpact/ui";

import { AuthField, AuthMessage } from "./auth-form-components";
import {
  getAuthFieldErrors,
  loginSchema,
  type AuthField as AuthFieldName,
  type AuthFormState,
} from "./auth-validation";
import { loginAction } from "./actions";

const initialState: AuthFormState = {
  message: "",
  fieldErrors: {},
};

export function LoginForm() {
  const [serverState, formAction, pending] = useActionState(loginAction, initialState);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<AuthFieldName, string>>
  >({});
  const errors = { ...serverState.fieldErrors, ...clientErrors };

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
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

      <AuthField error={errors.email} id="email" label="Adresse e-mail">
        <Input
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          autoFocus
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
          aria-describedby={errors.password ? "password-error" : undefined}
          aria-invalid={Boolean(errors.password)}
          autoComplete="current-password"
          id="password"
          maxLength={128}
          name="password"
          required
          type="password"
        />
      </AuthField>

      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Connexion en cours..." : "Se connecter"}
      </Button>
      {pending && (
        <p aria-live="polite" className="sr-only" role="status">
          Connexion en cours.
        </p>
      )}
      <p className="text-center text-sm text-slate-600">
        Pas encore de compte ?{" "}
        <Link
          className="font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-950"
          href="/register"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
