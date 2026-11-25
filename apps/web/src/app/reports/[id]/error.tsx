"use client";

import { Button, Card } from "@localimpact/ui";

export default function ReportDetailError({
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
      <h1 className="text-xl font-semibold text-slate-950">
        Impossible de charger ce signalement
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Réessayez dans quelques instants.
      </p>
      <Button className="mt-5" onClick={reset} type="button">
        Réessayer
      </Button>
    </Card>
  );
}
