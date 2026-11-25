import { Card } from "@localimpact/ui";

export default function ReportsLoading() {
  return (
    <section aria-busy="true" aria-label="Chargement des signalements" className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-36 animate-pulse bg-slate-200" />
        <div className="h-8 w-64 animate-pulse bg-slate-200" />
      </div>
      <Card className="h-36 animate-pulse bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card className="h-56 animate-pulse bg-slate-100" key={index} />
        ))}
      </div>
    </section>
  );
}
