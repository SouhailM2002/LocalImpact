import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { RegisterForm } from "@/features/auth/register-form";
import { getAuthenticatedUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Créer un compte",
};

export default async function RegisterPage() {
  const user = await getAuthenticatedUser();
  if (user !== null) {
    redirect("/reports");
  }

  return (
    <AuthPageShell
      eyebrow="Rejoindre la communauté"
      icon="users"
      intro="Inscrivez-vous pour participer aux améliorations locales."
      panelDescription="Rejoignez votre communauté pour signaler les problèmes et suivre les améliorations."
      panelHeadline={<>Votre voix.<br />Votre quartier.<br />Votre impact.</>}
      title="Créez votre compte"
    >
      <RegisterForm />
      <p className="mt-3 text-sm text-slate-600 sm:mt-5">
        <Link className="font-bold text-[#1F4FD8] underline underline-offset-4 hover:text-[#1840B0]" href="/">
          Retour à l’accueil
        </Link>
      </p>
    </AuthPageShell>
  );
}
