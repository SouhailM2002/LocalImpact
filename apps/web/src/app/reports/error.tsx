"use client";

import { Button, Card } from "@localimpact/ui";

export default function ReportsError({
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
      <h1 className="text-2xl font-black text-slate-950">
        Impossible de charger les signalements
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Une erreur est survenue pendant la récupération des résultats. Réessayez.
      </p>
      <Button className="mt-5" onClick={reset} type="button">
        Réessayer
      </Button>
    </Card>
  );
}
