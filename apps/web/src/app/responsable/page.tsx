import Link from "next/link";
import { redirect } from "next/navigation";
import type { SignalementListItemDto } from "@localimpact/application";
import { Badge, Card } from "@localimpact/ui";

import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { ChangeStatusForm } from "@/features/responsable/change-status-form";

const pageSize = 12;

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

function parsePage(value: string | string[] | undefined): number | null {
  if (value === undefined) {
    return 1;
  }
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}

function getPageHref(page: number): string {
  return page === 1 ? "/responsable" : `/responsable?page=${page}`;
}

function AssignedReportCard({ report }: { readonly report: SignalementListItemDto }) {
  const createdAt = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(report.createdAt);

  return (
    <Card className="flex h-full flex-col border-t-4 border-t-slate-950 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{report.category}</Badge>
          <Badge variant="neutral">{report.location}</Badge>
        </div>
        <Badge variant={statusVariants[report.status]}>
          {statusLabels[report.status]}
        </Badge>
      </div>
      <h2 className="mt-4 text-xl font-black leading-6 text-slate-950">
        <Link
          className="outline-none hover:text-[#1F4FD8] focus-visible:underline focus-visible:decoration-2"
          href={`/reports/${encodeURIComponent(report.id)}`}
        >
          {report.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {report.description}
      </p>
      <p className="mt-3 text-xs text-slate-500">
        Signalé le <time dateTime={report.createdAt.toISOString()}>{createdAt}</time>
        {report.creatorDisplayName && ` · par ${report.creatorDisplayName}`}
      </p>
      <div className="mt-auto pt-5">
        <ChangeStatusForm
          currentStatus={report.status}
          signalementId={report.id}
        />
      </div>
    </Card>
  );
}

export default async function ResponsablePage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, params] = await Promise.all([
    getAuthenticatedUser(),
    searchParams,
  ]);
  if (user === null) {
    redirect("/login");
  }
  if (user.role !== "RESPONSABLE") {
    redirect("/reports");
  }

  const page = parsePage(params.page);
  if (page === null) {
    redirect("/responsable");
  }

  const reports = await container.getSignalements.execute({
    actor: { userId: user.id, role: user.role },
    query: { page, pageSize },
  });
  if (reports.page !== page) {
    redirect(getPageHref(reports.page));
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="mb-3" variant="info">Espace Responsable</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Mes interventions
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            Consultez les signalements qui vous sont confiés et tenez leur avancement à jour.
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {reports.totalCount} signalement{reports.totalCount === 1 ? "" : "s"} assigné
          {reports.totalCount === 1 ? "" : "s"}
        </p>
      </header>

      {reports.reports.length === 0 ? (
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-black text-slate-950">
            Aucun signalement ne vous est assigné
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Les nouvelles affectations apparaîtront ici. Vous pouvez explorer les signalements
            pour consulter les informations accessibles à votre compte.
          </p>
          <Link
            className="mt-4 inline-flex min-h-10 items-center bg-[#1F4FD8] px-4 text-sm font-bold text-white hover:bg-[#1840B0]"
            href="/reports"
          >
            Explorer les signalements
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.reports.map((report) => (
            <AssignedReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {reports.totalPages > 1 && (
        <nav
          aria-label="Pagination des interventions"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5"
        >
          <p className="text-sm text-slate-600">
            Page {reports.page} sur {reports.totalPages}
          </p>
          <div className="flex gap-2">
            {reports.page > 1 && (
              <Link
                className="inline-flex min-h-10 items-center border-2 border-slate-900 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
                href={getPageHref(reports.page - 1)}
                rel="prev"
              >
                Précédent
              </Link>
            )}
            {reports.page < reports.totalPages && (
              <Link
                className="inline-flex min-h-10 items-center bg-[#1F4FD8] px-4 text-sm font-bold text-white hover:bg-[#1840B0]"
                href={getPageHref(reports.page + 1)}
                rel="next"
              >
                Suivant
              </Link>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}
