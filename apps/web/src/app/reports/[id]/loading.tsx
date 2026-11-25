import { Card } from "@localimpact/ui";

export default function ReportDetailLoading() {
  return (
    <article aria-busy="true" aria-label="Chargement du signalement" className="mx-auto max-w-4xl space-y-6">
      <Card className="h-96 animate-pulse border-t-4 border-t-slate-950 bg-slate-100" />
      <Card className="h-48 animate-pulse bg-slate-100" />
      <Card className="h-48 animate-pulse bg-slate-100" />
    </article>
  );
}
