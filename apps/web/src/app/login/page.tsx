import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Card } from "@localimpact/ui";

import { AppIcon } from "@/components/app-icon";
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
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <Badge className="mb-3" variant="info">
          <AppIcon className="size-3.5" name="shield" />
          Bienvenue
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Connectez-vous à LocalImpact
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          Retrouvez les signalements de votre communauté et leur suivi.
        </p>
      </div>
      {params.loggedOut === "1" && (
        <AuthMessage message="Vous êtes maintenant déconnecté." role="status" />
      )}
      <Card className="p-5 sm:p-8">
        <LoginForm />
      </Card>
      <p className="text-center text-sm text-slate-500">
        <Link className="font-medium text-teal-800 hover:underline" href="/">
          Retour à l’accueil
        </Link>
      </p>
    </section>
  );
}
