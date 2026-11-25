import Link from "next/link";
import { Badge, Card } from "@localimpact/ui";

import { AppIcon } from "../components/app-icon";
import { getAuthenticatedUser } from "../lib/auth-session";

const highlights = [
  {
    icon: "activity",
    title: "Suivre les actions",
    description:
      "Retrouvez les signalements et leur progression dans un espace clair et partagé.",
  },
  {
    icon: "users",
    title: "Agir ensemble",
    description:
      "La communauté peut soutenir les sujets importants et faire entendre ses besoins.",
  },
  {
    icon: "shield",
    title: "Des réponses visibles",
    description:
      "Les équipes responsables pourront documenter leurs interventions et résolutions.",
  },
] as const;

export default async function HomePage() {
  const viewer = await getAuthenticatedUser();

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden border-2 border-slate-950 bg-[#1F4FD8] px-6 py-9 text-white sm:px-9 sm:py-12 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 hidden size-72 border-[24px] border-white/10 lg:block" />
        <div className="relative max-w-4xl">
          <Badge className="border-white bg-white text-[#1F4FD8]">
            <AppIcon className="size-3.5" name="sparkles" />
            Espace communautaire
          </Badge>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-7xl">
            Ensemble, améliorons notre cadre de vie.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg sm:leading-8">
            Signalez les problèmes de votre campus ou de votre résidence,
            suivez leur évolution et contribuez à des solutions durables.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {viewer === null ? (
              <>
                <Link
                  className="inline-flex min-h-11 items-center justify-center border-2 border-white bg-white px-5 text-sm font-bold text-[#1F4FD8] transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href="/register"
                >
                  Créer un compte
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center border-2 border-white px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href="/login"
                >
                  Se connecter
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="inline-flex min-h-11 items-center justify-center border-2 border-white bg-white px-5 text-sm font-bold text-[#1F4FD8] transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href="/reports"
                >
                  Explorer les signalements
                </Link>
                {viewer.role === "USER" && (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center border-2 border-white px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    href="/reports/new"
                  >
                    Créer un signalement
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="getting-started-heading">
        <div className="mb-5">
          <p className="text-xs font-bold tracking-[0.2em] text-[#1F4FD8] uppercase">
            LocalImpact
          </p>
          <h2
            className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
            id="getting-started-heading"
          >
            Une communauté qui avance
          </h2>
        </div>
        <div className="grid gap-x-6 gap-y-8 md:grid-cols-3">
          {highlights.map((highlight) => (
            <article className="border-t-4 border-slate-950 pt-5" key={highlight.title}>
              <div className="flex size-11 items-center justify-center bg-[#1F4FD8] text-white">
                <AppIcon className="size-5" name={highlight.icon} />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-950">
                {highlight.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {highlight.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="workspace-note-heading">
        <Card className="flex flex-col gap-4 border-2 border-slate-950 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2
              className="text-lg font-black text-slate-950"
              id="workspace-note-heading"
            >
              Votre espace LocalImpact
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {viewer === null
                ? "Créez un compte ou connectez-vous pour commencer à explorer les signalements."
                : "Explorez les signalements de votre communauté et suivez leur évolution."}
            </p>
          </div>
          <Badge className="w-fit" variant="success">
            {viewer === null ? "Ouvert à la communauté" : "Espace actif"}
          </Badge>
        </Card>
      </section>
    </div>
  );
}
