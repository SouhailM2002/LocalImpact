import { z } from "zod";

export const authFields = [
  "name",
  "email",
  "password",
  "confirmPassword",
] as const;

export type AuthField = typeof authFields[number];

export interface AuthFormState {
  readonly message: string;
  readonly fieldErrors: Partial<Record<AuthField, string>>;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegistrationCredentials extends LoginCredentials {
  readonly name: string;
}

export type AuthFormResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly state: AuthFormState };

const emailSchema = z.string()
  .trim()
  .min(1, "Saisissez votre adresse e-mail.")
  .max(254, "L’adresse e-mail est trop longue.")
  .email("Saisissez une adresse e-mail valide.")
  .transform((email) => email.toLowerCase());

const passwordSchema = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registrationSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(80, "Le nom ne peut pas dépasser 80 caractères."),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Les mots de passe ne correspondent pas.",
});

export function getAuthFieldErrors(
  issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[],
): Partial<Record<AuthField, string>> {
  const fieldErrors: Partial<Record<AuthField, string>> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (
      typeof field === "string" &&
      authFields.some((candidate) => candidate === field) &&
      fieldErrors[field as AuthField] === undefined
    ) {
      fieldErrors[field as AuthField] = issue.message;
    }
  }

  return fieldErrors;
}

function invalidResult(
  issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[],
): AuthFormResult {
  return {
    ok: false,
    state: {
      message: "Vérifiez les champs indiqués.",
      fieldErrors: getAuthFieldErrors(issues),
    },
  };
}

export async function submitLoginForm(
  formData: FormData,
  authenticate: (credentials: LoginCredentials) => Promise<void>,
): Promise<AuthFormResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return invalidResult(parsed.error.issues);
  }

  await authenticate(parsed.data);
  return { ok: true };
}

export async function submitRegistrationForm(
  formData: FormData,
  createAccount: (credentials: RegistrationCredentials) => Promise<void>,
): Promise<AuthFormResult> {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return invalidResult(parsed.error.issues);
  }

  const { name, email, password } = parsed.data;
  await createAccount({ name, email, password });
  return { ok: true };
}
