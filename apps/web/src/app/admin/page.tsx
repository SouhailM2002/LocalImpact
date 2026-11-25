import Link from "next/link";
import { redirect } from "next/navigation";
import type {
  DashboardStatsDto,
  SignalementListItemDto,
  UserDisplayName,
} from "@localimpact/application";
import { Badge, Card } from "@localimpact/ui";

import { AssignResponsableForm } from "@/features/admin/assign-responsable-form";
import { UserRoleManagement } from "@/features/admin/user-role-management";
import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";

const pageSize = 20;

const reportStatuses = [
  { value: "NOUVEAU", label: "Nouveaux" },
  { value: "PRIS_EN_CHARGE", label: "Pris en charge" },
  { value: "EN_COURS", label: "En cours" },
  { value: "RESOLU", label: "Résolus" },
] as const;

const statusLabels = {
  NOUVEAU: "Nouveau",
  PRIS_EN_CHARGE: "Pris en charge",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
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

function formatResolutionTime(milliseconds: number | null): string {
  if (milliseconds === null) {
    return "Aucune résolution enregistrée";
  }

  const hours = milliseconds / (60 * 60 * 1000);
  const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  if (hours >= 24) {
    return `${formatter.format(hours / 24)} jours`;
  }
  if (hours >= 1) {
    return `${formatter.format(hours)} heures`;
  }
  return `${formatter.format(milliseconds / (60 * 1000))} minutes`;
}

function getPageHref(page: number): string {
  return page === 1 ? "/admin" : `/admin?page=${page}`;
}

function Statistics({
  stats,
  totalReports,
}: {
  readonly stats: DashboardStatsDto;
  readonly totalReports: number;
}) {
  const cards = [
    { label: "Signalements au total", value: String(totalReports) },
    ...reportStatuses.map((status) => ({
      label: status.label,
      value: String(stats.countsByStatus[status.value]),
    })),
    {
      label: "Délai moyen de résolution",
      value: formatResolutionTime(stats.averageResolutionTimeMs),
    },
  ];

  return (
    <section aria-label="Statistiques des signalements" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((item) => (
        <Card className="border-2 border-slate-900 p-4 sm:p-5" key={item.label}>
          <p className="text-sm font-semibold text-slate-600">{item.label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p>
        </Card>
      ))}
    </section>
  );
}

function CategoryBreakdown({ stats }: { readonly stats: DashboardStatsDto }) {
  return (
    <Card className="border-2 border-slate-900 p-5">
      <h2 className="text-lg font-black text-slate-950">Signalements par catégorie</h2>
      {stats.countsByCategory.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Aucune donnée à afficher.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200">
          {stats.countsByCategory.map(({ category, count }) => (
            <li className="flex items-center justify-between gap-4 py-2 text-sm" key={category}>
              <span className="font-medium text-slate-700">{category}</span>
              <span className="font-bold text-slate-950">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function AssignmentList({
  reports,
  responsables,
  page,
  totalPages,
}: {
  readonly reports: readonly SignalementListItemDto[];
  readonly responsables: readonly UserDisplayName[];
  readonly page: number;
  readonly totalPages: number;
}) {
  const namesById = new Map(responsables.map(({ id, displayName }) => [id, displayName]));

  return (
    <Card className="overflow-hidden border-2 border-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-900 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-black text-slate-950">Affectation des responsables</h2>
          <p className="mt-1 text-sm text-slate-600">
            Affectez chaque signalement à un membre de l’équipe.
          </p>
        </div>
        <Badge variant="neutral">Page {page} / {totalPages}</Badge>
      </div>

      {reports.length === 0 ? (
        <p className="p-6 text-sm text-slate-600">Aucun signalement à affecter.</p>
      ) : (
        <div className="overflow-x-auto">
          {responsables.length === 0 && (
            <p className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Aucun compte Responsable n’est configuré. Les affectations seront disponibles
              après la création d’un compte Responsable.
            </p>
          )}
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3" scope="col">Signalement</th>
                <th className="px-4 py-3" scope="col">Statut</th>
                <th className="px-4 py-3" scope="col">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-4 align-top">
                    <Link
                      className="font-bold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:text-[#1F4FD8]"
                      href={`/reports/${encodeURIComponent(report.id)}`}
                    >
                      {report.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-600">
                      {report.category} · {report.location}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Assigné à: {report.assignedResponsableId
                        ? namesById.get(report.assignedResponsableId) ?? "Compte indisponible"
                        : "Personne"}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Badge variant={report.status === "RESOLU" ? "success" : "neutral"}>
                      {statusLabels[report.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {responsables.length > 0 ? (
                      <AssignResponsableForm
                        currentResponsableId={report.assignedResponsableId}
                        responsables={responsables}
                        signalementId={report.id}
                      />
                    ) : (
                      <span className="text-sm text-slate-500">Indisponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pages des signalements à affecter"
          className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3"
        >
          {page > 1 ? (
            <Link
              className="font-semibold text-[#1F4FD8] hover:underline"
              href={getPageHref(page - 1)}
              rel="prev"
            >
              Page précédente
            </Link>
          ) : <span />}
          {page < totalPages ? (
            <Link
              className="font-semibold text-[#1F4FD8] hover:underline"
              href={getPageHref(page + 1)}
              rel="next"
            >
              Page suivante
            </Link>
          ) : <span />}
        </nav>
      )}
    </Card>
  );
}

export default async function AdminPage({
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
  if (user.role !== "ADMIN") {
    redirect("/reports");
  }

  const page = parsePage(params.page);
  if (page === null) {
    redirect("/admin");
  }

  const actor = { userId: user.id, role: user.role } as const;
  const [stats, reports, responsables, managedUsers] = await Promise.all([
    container.getDashboardStats.execute(actor),
    container.getSignalements.execute({ actor, query: { page, pageSize } }),
    container.getResponsables.execute(actor),
    container.getUsersForAdmin.execute(actor),
  ]);

  if (reports.page !== page) {
    redirect(getPageHref(reports.page));
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="mb-3" variant="info">Administration</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Tableau de bord
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            Suivez l’activité et répartissez les signalements entre les responsables.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center border-2 border-slate-900 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
          href="/reports"
        >
          Explorer tous les signalements
        </Link>
      </header>

      <Statistics stats={stats} totalReports={reports.totalCount} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <AssignmentList
          page={reports.page}
          reports={reports.reports}
          responsables={responsables}
          totalPages={reports.totalPages}
        />
        <CategoryBreakdown stats={stats} />
      </div>
      <UserRoleManagement currentAdminId={user.id} users={managedUsers} />
    </div>
  );
}
