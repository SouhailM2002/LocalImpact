import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Button, Card, Input } from "@localimpact/ui";

import { container } from "@/container";
import { AppIcon } from "@/components/app-icon";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { ReportCard } from "@/features/signalements/report-card";
import { reportExplorationSchema } from "@/features/signalements/report-exploration-schema";

const pageSize = 12;

type SearchParams = Record<string, string | string[] | undefined>;

function getPageHref(
  page: number,
  filters: {
    readonly keyword?: string;
    readonly category?: string;
    readonly location?: string;
    readonly status?: string;
  },
): string {
  const params = new URLSearchParams();
  if (filters.keyword !== undefined) params.set("keyword", filters.keyword);
  if (filters.category !== undefined) params.set("category", filters.category);
  if (filters.location !== undefined) params.set("location", filters.location);
  if (filters.status !== undefined) params.set("status", filters.status);
  params.set("page", String(page));
  return `/reports?${params.toString()}`;
}

function InvalidFilters() {
  return (
    <Card className="border-2 border-amber-700 bg-amber-50 p-5" role="alert">
      <h2 className="font-bold text-amber-950">Filtres invalides</h2>
      <p className="mt-1 text-sm leading-6 text-amber-900">
        Vérifiez les critères de recherche et le numéro de page.
      </p>
      <Link
        className="mt-3 inline-flex text-sm font-bold text-amber-950 underline underline-offset-4"
        href="/reports"
      >
        Réinitialiser les filtres
      </Link>
    </Card>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  readonly searchParams: Promise<SearchParams>;
}) {
  const [params, user] = await Promise.all([
    searchParams,
    getAuthenticatedUser(),
  ]);

  if (user === null) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <PageHeading />
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-black text-slate-950">
            Connexion requise
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Connectez-vous pour explorer les signalements accessibles à votre compte.
          </p>
        </Card>
      </section>
    );
  }

  const parsedFilters = reportExplorationSchema.safeParse({
    keyword: params.keyword,
    category: params.category,
    location: params.location,
    status: params.status,
    page: params.page,
  });

  if (!parsedFilters.success) {
    return (
      <section className="space-y-6">
        <PageHeading />
        <InvalidFilters />
      </section>
    );
  }

  const filters = parsedFilters.data;
  const result = await container.getSignalements.execute({
    actor: { userId: user.id, role: user.role },
    query: {
      ...(filters.keyword === undefined ? {} : { keyword: filters.keyword }),
      ...(filters.category === undefined ? {} : { category: filters.category }),
      ...(filters.location === undefined ? {} : { location: filters.location }),
      ...(filters.status === undefined ? {} : { status: filters.status }),
      page: filters.page,
      pageSize,
    },
  });

  if (result.page !== filters.page) {
    redirect(getPageHref(result.page, filters));
  }

  return (
    <section className="space-y-6">
      <PageHeading />

      <Card className="border-2 border-slate-900 p-4 sm:p-5">
        <form action="/reports" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" method="get">
          <div className="sm:col-span-2 xl:col-span-4">
            <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="keyword">
              Recherche
            </label>
            <Input
              autoComplete="off"
              id="keyword"
              maxLength={120}
              name="keyword"
              placeholder="Rechercher dans les titres et descriptions"
              type="search"
              defaultValue={filters.keyword ?? ""}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="category">
              Catégorie
            </label>
            <Input
              id="category"
              maxLength={80}
              name="category"
              placeholder="Toutes les catégories"
              defaultValue={filters.category ?? ""}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="location">
              Lieu
            </label>
            <Input
              id="location"
              maxLength={160}
              name="location"
              placeholder="Tous les lieux"
              defaultValue={filters.location ?? ""}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900" htmlFor="status">
              Statut
            </label>
            <select
              className="min-h-11 w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
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
              Appliquer
            </Button>
            <Link
              className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              href="/reports"
            >
              Effacer
            </Link>
          </div>
        </form>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-slate-600">
          {result.totalCount} signalement{result.totalCount === 1 ? "" : "s"}
        </p>
        {user.role === "USER" && (
          <Link
            className="inline-flex min-h-10 items-center gap-2 bg-[#1F4FD8] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1840B0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
            href="/reports/new"
          >
            <AppIcon className="size-4" name="plus" />
            Créer un signalement
          </Link>
        )}
      </div>

      {result.reports.length === 0 ? (
        <Card className="px-6 py-12 text-center">
          <Badge className="mb-3" variant="neutral">Aucun résultat</Badge>
          <h2 className="text-xl font-black text-slate-950">
            Aucun signalement ne correspond à ces filtres
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Modifiez vos critères ou effacez les filtres pour afficher tous les signalements.
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-bold text-[#1F4FD8] underline underline-offset-4"
            href="/reports"
          >
            Effacer les filtres
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.reports.map((report) => (
            <ReportCard key={report.id} report={report} viewerId={user.id} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <nav
          aria-label="Pagination des signalements"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5"
        >
          <p className="text-sm text-slate-600">
            Page {result.page} sur {result.totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                className="inline-flex min-h-10 items-center border-2 border-slate-900 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
                href={getPageHref(result.page - 1, filters)}
                rel="prev"
              >
                Précédent
              </Link>
            ) : (
              <span className="inline-flex min-h-10 items-center border-2 border-slate-200 px-4 text-sm text-slate-400">
                Précédent
              </span>
            )}
            {result.page < result.totalPages ? (
              <Link
                className="inline-flex min-h-10 items-center bg-[#1F4FD8] px-4 text-sm font-bold text-white hover:bg-[#1840B0]"
                href={getPageHref(result.page + 1, filters)}
                rel="next"
              >
                Suivant
              </Link>
            ) : (
              <span className="inline-flex min-h-10 items-center border-2 border-slate-200 px-4 text-sm text-slate-400">
                Suivant
              </span>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}

function PageHeading() {
  return (
    <div>
      <Badge className="mb-3" variant="info">
        <AppIcon className="size-3.5" name="search" />
        Explorer
      </Badge>
      <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Signalements de la communauté
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
        Recherchez les problèmes signalés et suivez leur prise en charge.
      </p>
    </div>
  );
}
