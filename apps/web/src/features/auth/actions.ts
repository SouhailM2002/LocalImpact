"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import {
  submitLoginForm,
  submitRegistrationForm,
  type AuthFormState,
} from "./auth-validation";

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const result = await submitLoginForm(formData, async (credentials) => {
      await auth.api.signInEmail({
        body: credentials,
        headers: await headers(),
      });
    });

    if (!result.ok) {
      return result.state;
    }
  } catch (error) {
    if (isAPIError(error)) {
      return {
        message: "Adresse e-mail ou mot de passe invalide.",
        fieldErrors: {},
      };
    }
    throw error;
  }

  redirect("/reports");
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const result = await submitRegistrationForm(formData, async (credentials) => {
      await auth.api.signUpEmail({
        body: credentials,
        headers: await headers(),
      });
    });

    if (!result.ok) {
      return result.state;
    }
  } catch (error) {
    if (isAPIError(error)) {
      return {
        message: "Impossible de créer le compte avec ces informations.",
        fieldErrors: {},
      };
    }
    throw error;
  }

  redirect("/reports");
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login?loggedOut=1");
}
