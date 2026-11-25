import { Badge, Card } from "@localimpact/ui";

import { AppIcon } from "../../../components/app-icon";
import { getAuthenticatedUser } from "../../../lib/auth-session";
import { CreateSignalementForm } from "./create-signalement-form";

export default async function CreateSignalementPage() {
  const user = await getAuthenticatedUser();

  if (user === null) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <PageHeading />
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Connexion requise
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Connectez-vous avec un compte membre pour créer un signalement.
          </p>
        </Card>
      </section>
    );
  }

  if (user.role !== "USER") {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <PageHeading />
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Action non autorisée
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            La création de signalements est réservée aux membres.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <PageHeading />
      <Card className="p-5 sm:p-8">
        <CreateSignalementForm />
      </Card>
    </section>
  );
}

function PageHeading() {
  return (
    <div>
      <Badge className="mb-3" variant="info">
        <AppIcon className="size-3.5" name="plus" />
        Nouveau signalement
      </Badge>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        Décrivez le problème
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        Partagez les informations nécessaires pour que votre communauté puisse
        comprendre et résoudre la situation.
      </p>
    </div>
  );
}
