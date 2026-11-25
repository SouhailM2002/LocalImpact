"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="fr">
      <body style={{ background: "#f8fafc", color: "#0f172a", fontFamily: "sans-serif" }}>
        <main
          aria-labelledby="global-error-title"
          style={{ margin: "10vh auto", maxWidth: "36rem", padding: "2rem", textAlign: "center" }}
        >
          <h1 id="global-error-title">LocalImpact est momentanément indisponible</h1>
          <p>Une erreur inattendue s’est produite. Réessayez dans quelques instants.</p>
          {error.digest && <p>Référence : {error.digest}</p>}
          <button onClick={reset} style={{ cursor: "pointer", padding: "0.75rem 1rem" }} type="button">
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
