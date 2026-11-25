import Image from "next/image";
import Link from "next/link";
import type { SignalementDetailDto } from "@localimpact/application";
import { Badge, Card } from "@localimpact/ui";

import { AppIcon } from "@/components/app-icon";
import { ReportComments } from "./report-comments";
import { ReportStatusHistory } from "./report-status-history";

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

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(value);
}

export function ReportDetailView({
  detail,
  viewerId,
  wasJustCreated,
}: {
  readonly detail: SignalementDetailDto;
  readonly viewerId: string;
  readonly wasJustCreated: boolean;
}) {
  const { report } = detail;
  const creatorName = report.creatorId === viewerId
    ? "Vous"
    : report.creatorDisplayName ?? "Compte indisponible";
  const responsableName = report.assignedResponsableId === undefined
    ? "Aucun responsable assigné"
    : report.assignedResponsableDisplayName ?? "Responsable indisponible";

  return (
    <article className="mx-auto max-w-4xl space-y-7">
      {wasJustCreated && (
        <div
          aria-live="polite"
          className="flex items-center gap-2 border-2 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900"
          role="status"
        >
          <AppIcon className="size-5" name="activity" />
          Votre signalement a bien été créé.
        </div>
      )}

      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#1F4FD8]"
        href="/reports"
      >
        <AppIcon className="size-4 -rotate-90" name="chevron-down" />
        Retour aux signalements
      </Link>

      <Card className="overflow-hidden">
        {report.photoUrl && (
          <Image
            alt={`Photo du signalement : ${report.title}`}
            className="max-h-[28rem] w-full bg-slate-100 object-cover"
            height={720}
            src={report.photoUrl}
            width={1280}
          />
        )}
        <div className="space-y-5 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">{report.category}</Badge>
              <Badge variant="neutral">{report.location}</Badge>
            </div>
            <Badge variant={statusVariants[report.status]}>
              {statusLabels[report.status]}
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {report.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Créé le{" "}
              <time dateTime={report.createdAt.toISOString()}>
                {formatDate(report.createdAt)}
              </time>
            </p>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
            {report.description}
          </p>

          <dl className="grid gap-4 border-t-2 border-slate-900 pt-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Créé par
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{creatorName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Responsable
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {responsableName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Soutiens
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {report.supportCount}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <ReportStatusHistory history={detail.statusHistory} />
      <ReportComments comments={detail.comments} />
    </article>
  );
}
