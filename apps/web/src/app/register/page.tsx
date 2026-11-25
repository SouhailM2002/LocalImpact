import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Card } from "@localimpact/ui";

import { AppIcon } from "@/components/app-icon";
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
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <Badge className="mb-3" variant="info">
          <AppIcon className="size-3.5" name="users" />
          Rejoindre la communauté
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Créez votre compte
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          Inscrivez-vous pour signaler un problème et suivre les améliorations.
        </p>
      </div>
      <Card className="p-5 sm:p-8">
        <RegisterForm />
      </Card>
      <p className="text-center text-sm text-slate-500">
        <Link className="font-medium text-teal-800 hover:underline" href="/">
          Retour à l’accueil
        </Link>
      </p>
    </section>
  );
}
