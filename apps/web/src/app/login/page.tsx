import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { AuthMessage } from "@/features/auth/auth-form-components";
import { LoginForm } from "@/features/auth/login-form";
import { getAuthenticatedUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly loggedOut?: string }>;
}) {
  const [user, params] = await Promise.all([
    getAuthenticatedUser(),
    searchParams,
  ]);
  if (user !== null) {
    redirect("/reports");
  }

  return (
    <AuthPageShell
      eyebrow="Bienvenue"
      icon="shield"
      intro="Accédez à votre espace communautaire."
      panelDescription="Retrouvez les signalements de votre communauté et suivez leur évolution."
      panelHeadline={<>Signalez.<br />Mobilisez.<br />Suivez.</>}
      title="Connectez-vous à LocalImpact"
    >
      {params.loggedOut === "1" && (
        <AuthMessage message="Vous êtes maintenant déconnecté." role="status" />
      )}
      <LoginForm />
      <p className="mt-3 text-sm text-slate-600 sm:mt-5">
        <Link className="font-bold text-[#1F4FD8] underline underline-offset-4 hover:text-[#1840B0]" href="/">
          Retour à l’accueil
        </Link>
      </p>
    </AuthPageShell>
  );
}
