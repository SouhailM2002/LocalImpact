"use client";

import { useEffect } from "react";
import { Button, Card } from "@localimpact/ui";

export function RouteErrorState({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-xl border-2 border-rose-700 p-6 text-center sm:p-8">
      <h1 className="text-2xl font-black text-slate-950">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        La page n’a pas pu être chargée. Réessayez dans quelques instants.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-slate-500">
          Référence : <code>{error.digest}</code>
        </p>
      )}
      <Button className="mt-5" onClick={reset} type="button">
        Réessayer
      </Button>
    </Card>
  );
}
