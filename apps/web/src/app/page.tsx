import { Badge, Card } from "@localimpact/ui";

import { AppIcon } from "../components/app-icon";

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

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 px-6 py-9 text-white shadow-lg shadow-teal-950/10 sm:px-9 sm:py-12 lg:px-12">
        <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-4 -top-12 size-56 rounded-full border border-white/10" />
        <div className="relative max-w-3xl">
          <Badge className="border border-white/20 bg-white/10 text-teal-50 ring-0">
            <AppIcon className="size-3.5" name="sparkles" />
            Espace communautaire
          </Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Ensemble, améliorons notre cadre de vie.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-teal-50/90 sm:text-base sm:leading-8">
            Signalez les problèmes de votre campus ou de votre résidence,
            suivez leur évolution et contribuez à des solutions durables.
          </p>
        </div>
      </section>

      <section aria-labelledby="getting-started-heading">
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-teal-700 uppercase">
            LocalImpact
          </p>
          <h2
            className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
            id="getting-started-heading"
          >
            Une communauté qui avance
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <Card className="p-5 sm:p-6" key={highlight.title}>
              <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <AppIcon className="size-5" name={highlight.icon} />
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900">
                {highlight.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {highlight.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="workspace-note-heading">
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2
              className="text-sm font-semibold text-slate-900"
              id="workspace-note-heading"
            >
              Votre espace LocalImpact
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Les signalements, tableaux de bord et outils par rôle seront accessibles ici.
            </p>
          </div>
          <Badge className="w-fit" variant="info">Plateforme en préparation</Badge>
        </Card>
      </section>
    </div>
  );
}
