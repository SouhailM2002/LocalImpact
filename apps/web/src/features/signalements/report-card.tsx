import Link from "next/link";
import type { SignalementListItemDto } from "@localimpact/application";
import { Badge, Card } from "@localimpact/ui";

const statusLabels = {
  NOUVEAU: "Nouveau",
  PRIS_EN_CHARGE: "Pris en charge",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
} as const;

const statusVariants = {
  NOUVEAU: "info",
  PRIS_EN_CHARGE: "warning",
  EN_COURS: "warning",
  RESOLU: "success",
} as const;

export function ReportCard({
  report,
  viewerId,
}: {
  readonly report: SignalementListItemDto;
  readonly viewerId: string;
}) {
  const creatorName = report.creatorId === viewerId
    ? "Vous"
    : report.creatorDisplayName;
  const createdAt = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(report.createdAt);

  return (
    <Card className="flex h-full flex-col border-t-4 border-t-slate-950 p-5 transition-colors hover:bg-slate-50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{report.category}</Badge>
          <Badge variant={statusVariants[report.status]}>
            {statusLabels[report.status]}
          </Badge>
        </div>
        <span className="shrink-0 text-xs text-slate-500">{createdAt}</span>
      </div>

      <h2 className="mt-4 text-xl font-black leading-6 text-slate-950">
        <Link
          className="outline-none hover:text-[#1F4FD8] focus-visible:underline focus-visible:decoration-2"
          href={`/reports/${encodeURIComponent(report.id)}`}
        >
          {report.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
        {report.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            {report.location}
          </p>
          {creatorName !== null && (
            <p className="mt-1 truncate text-xs text-slate-500">
              Créé par {creatorName}
            </p>
          )}
        </div>
        <p className="shrink-0 text-xs font-medium text-slate-500">
          {report.supportCount} soutien{report.supportCount === 1 ? "" : "s"}
        </p>
      </div>
    </Card>
  );
}
