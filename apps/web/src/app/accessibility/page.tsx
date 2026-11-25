import Link from "next/link";
import { redirect } from "next/navigation";
import type { SignalementListItemDto } from "@localimpact/application";
import type { AccessibilityImpact, AccessibilityUrgency } from "@localimpact/domain";
import { Badge, Button, Card } from "@localimpact/ui";

import { AppIcon } from "@/components/app-icon";
import { container } from "@/container";
import {
  getAccessibilityBarrierLabel,
  getAccessibilityImpactLabel,
  getAccessibilityUrgencyLabel,
  reportStatusLabels,
} from "@/features/signalements/accessibility-labels";
import { accessibilityTrackingSchema } from "@/features/signalements/accessibility-tracking-schema";
import { InteractiveMap } from "@/features/signalements/interactive-map";
import type { ReportMapMarker } from "@/features/signalements/map-types";
import { getAuthenticatedUser } from "@/lib/auth-session";

const pageSize = 12;

const statusVariants = {
  NOUVEAU: "info",
  PRIS_EN_CHARGE: "warning",
  EN_COURS: "warning",
  RESOLU: "success",
} as const;

type SearchParams = Record<string, string | string[] | undefined>;

function getTrackingHref(
  filters: {
    readonly impact?: AccessibilityImpact;
    readonly urgency?: AccessibilityUrgency;
    readonly status?: SignalementListItemDto["status"];
    readonly page: number;
    readonly view: "list" | "map";
  },
): string {
  const params = new URLSearchParams();
  if (filters.impact !== undefined) params.set("impact", filters.impact);
  if (filters.urgency !== undefined) params.set("urgency", filters.urgency);
  if (filters.status !== undefined) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.view === "map") params.set("view", "map");
  const query = params.toString();
  return query === "" ? "/accessibility" : `/accessibility?${query}`;
}

function TrackingFilters({
  filters,
}: {
  readonly filters: {
    readonly impact?: AccessibilityImpact;
    readonly urgency?: AccessibilityUrgency;
    readonly status?: SignalementListItemDto["status"];
  };
}) {
  return (
    <Card className="border-2 border-slate-900 p-4 sm:p-5">
      <form action="/accessibility" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" method="get">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="impact">
            Impact
          </label>
          <select
            className="min-h-11 w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-950"
            defaultValue={filters.impact ?? ""}
            id="impact"
            name="impact"
          >
            <option value="">Tous les impacts</option>
            <option value="MOBILITY">Mobilité</option>
            <option value="VISION">Vision</option>
            <option value="HEARING">Audition</option>
            <option value="COGNITIVE">Compréhension et orientation</option>
            <option value="OTHER">Autre impact</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="urgency">
            Urgence
          </label>
          <select
            className="min-h-11 w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-950"
            defaultValue={filters.urgency ?? ""}
            id="urgency"
            name="urgency"
          >
            <option value="">Toutes les urgences</option>
            <option value="HIGH">Élevée</option>
            <option value="MEDIUM">Modérée</option>
            <option value="LOW">Faible</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="status">
            Suivi
          </label>
          <select
            className="min-h-11 w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-950"
            defaultValue={filters.status ?? ""}
            id="status"
            name="status"
          >
            <option value="">Tous les statuts</option>
            <option value="NOUVEAU">Nouveau</option>
            <option value="PRIS_EN_CHARGE">Pris en charge</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLU">Résolu</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <Button className="flex-1" type="submit">
            <AppIcon className="size-4" name="search" />
            Filtrer
          </Button>
          <Link
            className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            href="/accessibility"
          >
            Effacer
          </Link>
        </div>
      </form>
    </Card>
  );
}

function AccessibilityReportCard({ report }: { readonly report: SignalementListItemDto }) {
  if (
    report.accessibilityBarrierType === undefined ||
    report.accessibilityImpact === undefined ||
    report.accessibilityUrgency === undefined
  ) {
    return null;
  }

  return (
    <Card className="flex h-full flex-col border-t-4 border-t-slate-950 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Badge variant={report.accessibilityUrgency === "HIGH" ? "warning" : "neutral"}>
          Urgence {getAccessibilityUrgencyLabel(report.accessibilityUrgency)}
        </Badge>
        <Badge variant={statusVariants[report.status]}>
          {reportStatusLabels[report.status]}
        </Badge>
      </div>
      <h2 className="mt-4 text-xl font-black leading-6 text-slate-950">
        <Link
          className="outline-none hover:text-[#1F4FD8] focus-visible:underline"
          href={`/reports/${encodeURIComponent(report.id)}`}
        >
          {report.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {report.description}
      </p>
      <dl className="mt-4 grid gap-2 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Obstacle</dt>
          <dd className="mt-1 font-semibold text-slate-800">
            {getAccessibilityBarrierLabel(report.accessibilityBarrierType)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Impact</dt>
          <dd className="mt-1 font-semibold text-slate-800">
            {getAccessibilityImpactLabel(report.accessibilityImpact)}
          </dd>
        </div>
      </dl>
      <p className="mt-auto border-t border-slate-100 pt-4 text-sm font-medium text-slate-700">
        {report.location}
      </p>
    </Card>
  );
}

export default async function AccessibilityPage({
  searchParams,
}: {
  readonly searchParams: Promise<SearchParams>;
}) {
  const [user, params] = await Promise.all([
    getAuthenticatedUser(),
    searchParams,
  ]);
  if (user === null) {
    redirect("/login");
  }

  const parsed = accessibilityTrackingSchema.safeParse({
    impact: params.impact,
    urgency: params.urgency,
    status: params.status,
    page: params.page,
    view: params.view,
  });
  if (!parsed.success) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-black text-slate-950">Suivi de l’accessibilité</h1>
        <Card className="border-2 border-amber-700 bg-amber-50 p-5" role="alert">
          <h2 className="font-bold text-amber-950">Filtres invalides</h2>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Vérifiez les critères de suivi et le numéro de page.
          </p>
          <Link className="mt-3 inline-flex text-sm font-bold underline" href="/accessibility">
            Réinitialiser les filtres
          </Link>
        </Card>
      </section>
    );
  }

  const filters = parsed.data;
  const query = {
    accessibilityOnly: true,
    ...(filters.impact === undefined ? {} : { accessibilityImpact: filters.impact }),
    ...(filters.urgency === undefined ? {} : { accessibilityUrgency: filters.urgency }),
    ...(filters.status === undefined ? {} : { status: filters.status }),
    page: filters.page,
    pageSize,
  };
  const result = await container.getSignalements.execute({
    actor: { userId: user.id, role: user.role },
    query,
  });

  if (result.page !== filters.page) {
    redirect(getTrackingHref({ ...filters, page: result.page }));
  }

  const reports = result.reports.filter((report) => (
    report.accessibilityBarrierType !== undefined &&
    report.accessibilityImpact !== undefined &&
    report.accessibilityUrgency !== undefined
  ));
  const markers: ReportMapMarker[] = reports.flatMap((report) => (
    report.latitude === undefined || report.longitude === undefined
      ? []
      : [{
          id: report.id,
          title: report.title,
          status: reportStatusLabels[report.status],
          latitude: report.latitude,
          longitude: report.longitude,
        }]
  ));
  const currentFilters = {
    ...(filters.impact === undefined ? {} : { impact: filters.impact }),
    ...(filters.urgency === undefined ? {} : { urgency: filters.urgency }),
    ...(filters.status === undefined ? {} : { status: filters.status }),
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="mb-3" variant="info">Accessibilité</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Suivi des obstacles d’accessibilité
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            Filtrez les obstacles par impact et urgence, puis suivez leur avancement
            dans le workflow habituel des signalements.
          </p>
        </div>
        <p aria-live="polite" className="text-sm font-semibold text-slate-700">
          {result.totalCount} problème{result.totalCount === 1 ? "" : "s"} suivi
          {result.totalCount === 1 ? "" : "s"}
        </p>
      </header>

      <TrackingFilters filters={currentFilters} />

      <nav aria-label="Affichage du suivi d’accessibilité" className="flex gap-2">
        {(["list", "map"] as const).map((view) => (
          <Link
            aria-current={filters.view === view ? "page" : undefined}
            className={`inline-flex min-h-10 items-center border-2 px-4 text-sm font-bold ${
              filters.view === view
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
            href={getTrackingHref({ ...filters, view, page: result.page })}
            key={view}
          >
            {view === "list" ? "Liste" : "Carte"}
          </Link>
        ))}
      </nav>

      {reports.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-black text-slate-950">
            Aucun problème d’accessibilité trouvé
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Modifiez les filtres ou créez un signalement avec le suivi d’accessibilité activé.
          </p>
          {user.role === "USER" && (
            <Link
              className="mt-4 inline-flex min-h-10 items-center bg-[#1F4FD8] px-4 text-sm font-bold text-white"
              href="/reports/new"
            >
              Créer un signalement
            </Link>
          )}
        </Card>
      ) : filters.view === "map" ? (
        markers.length === 0 ? (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-black text-slate-950">
              Aucun repère cartographique sur cette page
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Ces signalements n’ont pas encore de coordonnées.
            </p>
          </Card>
        ) : (
          <Card className="space-y-3 border-2 border-slate-900 p-3 sm:p-4">
            <p className="text-sm text-slate-600">
              {markers.length} point{markers.length === 1 ? "" : "s"} géolocalisé
              {markers.length === 1 ? "" : "s"} sur cette page.
            </p>
            <InteractiveMap
              center={{
                latitude: markers[0]?.latitude ?? 0,
                longitude: markers[0]?.longitude ?? 0,
              }}
              markers={markers}
            />
          </Card>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <AccessibilityReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <nav aria-label="Pages du suivi d’accessibilité" className="flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <p className="text-sm text-slate-600">
            Page {result.page} sur {result.totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                className="inline-flex min-h-10 items-center border-2 border-slate-900 bg-white px-4 text-sm font-bold text-slate-900"
                href={getTrackingHref({ ...filters, page: result.page - 1 })}
                rel="prev"
              >
                Précédent
              </Link>
            )}
            {result.page < result.totalPages && (
              <Link
                className="inline-flex min-h-10 items-center bg-[#1F4FD8] px-4 text-sm font-bold text-white"
                href={getTrackingHref({ ...filters, page: result.page + 1 })}
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
