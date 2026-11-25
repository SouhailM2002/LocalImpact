import type { ReactNode } from "react";
import Link from "next/link";
import type { UserRole } from "@localimpact/application";
import { Badge, Card, Input, buttonClassName } from "@localimpact/ui";

import { logoutAction } from "../features/auth/actions";
import { AppIcon, type AppIconName } from "./app-icon";

export interface AppViewer {
  readonly displayName: string;
  readonly email: string;
  readonly role: UserRole;
}

interface NavigationItem {
  readonly href: string;
  readonly label: string;
  readonly icon: AppIconName;
}

const sharedNavigation: readonly NavigationItem[] = [
  { href: "/", label: "Tableau de bord", icon: "dashboard" },
  { href: "/reports", label: "Explorer les signalements", icon: "search" },
];

const roleNavigation: Readonly<Record<UserRole, readonly NavigationItem[]>> = {
  USER: [
    { href: "/reports/new", label: "Créer un signalement", icon: "plus" },
    { href: "/my-reports", label: "Mes signalements", icon: "activity" },
  ],
  RESPONSABLE: [
    { href: "/assigned-reports", label: "Signalements assignés", icon: "activity" },
  ],
  ADMIN: [
    { href: "/admin", label: "Administration", icon: "shield" },
  ],
};

function getNavigation(viewer: AppViewer | null): readonly NavigationItem[] {
  return [
    ...sharedNavigation,
    ...(viewer ? roleNavigation[viewer.role] : []),
  ];
}

function Brand({ compact = false }: { readonly compact?: boolean }) {
  return (
    <Link
      aria-label="LocalImpact, accueil"
      className="inline-flex items-center gap-3"
      href="/"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-900/20">
        <AppIcon className="size-5" name="sparkles" />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight text-slate-950">
          Local<span className="text-teal-700">Impact</span>
        </span>
      )}
    </Link>
  );
}

function NavigationLinks({
  viewer,
  activePath,
}: {
  readonly viewer: AppViewer | null;
  readonly activePath: string;
}) {
  return (
    <ul className="space-y-1">
      {getNavigation(viewer).map((item) => {
        const isActive = item.href === "/"
          ? activePath === "/"
          : activePath === item.href || activePath.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              aria-current={isActive ? "page" : undefined}
              className={[
                "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")}
              href={item.href}
            >
              <AppIcon
                className={[
                  "size-[18px] shrink-0",
                  isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-600",
                ].join(" ")}
                name={item.icon}
              />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Sidebar({
  viewer,
  activePath,
}: {
  readonly viewer: AppViewer | null;
  readonly activePath: string;
}) {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-5 py-6 lg:flex">
      <Brand />
      <p className="mb-9 mt-3 pl-1 text-xs leading-5 text-slate-500">
        Agir ensemble pour un meilleur cadre de vie.
      </p>

      <p className="mb-3 px-3 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
        Espace de travail
      </p>
      <nav aria-label="Navigation principale">
        <NavigationLinks activePath={activePath} viewer={viewer} />
      </nav>

      <div className="mt-auto pt-8">
        <Card className="border-teal-100 bg-teal-50/70 p-4 shadow-none">
          <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
            <AppIcon className="size-[18px]" name="sparkles" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Votre voix compte
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Chaque signalement aide la communauté à avancer.
          </p>
        </Card>
        <p className="mt-5 px-1 text-xs text-slate-400">
          LocalImpact · Espace communautaire
        </p>
      </div>
    </aside>
  );
}

function MobileNavigation({
  viewer,
  activePath,
}: {
  readonly viewer: AppViewer | null;
  readonly activePath: string;
}) {
  return (
    <details className="relative lg:hidden">
      <summary
        aria-label="Ouvrir la navigation"
        className={`${buttonClassName("secondary", "icon")} list-none cursor-pointer`}
      >
        <AppIcon className="size-5" name="menu" />
      </summary>
      <div className="absolute left-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/10">
        <div className="mb-3 px-3 py-2">
          <Brand />
        </div>
        <nav aria-label="Navigation mobile">
          <NavigationLinks activePath={activePath} viewer={viewer} />
        </nav>
      </div>
    </details>
  );
}

function NotificationsMenu() {
  return (
    <details className="relative">
      <summary
        aria-label="Notifications"
        className={`${buttonClassName("ghost", "icon")} list-none cursor-pointer`}
        title="Notifications"
      >
        <AppIcon className="size-5" name="bell" />
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-teal-600 ring-2 ring-white" />
      </summary>
      <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10">
        <p className="text-sm font-semibold text-slate-900">Notifications</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Les nouvelles notifications apparaîtront ici.
        </p>
        <Badge className="mt-3" variant="info">Bientôt disponible</Badge>
      </div>
    </details>
  );
}

function ProfileMenu({ viewer }: { readonly viewer: AppViewer | null }) {
  const name = viewer?.displayName ?? "Visiteur";
  const initials = viewer
    ? viewer.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
    : "V";
  const roleLabel = viewer
    ? {
      USER: "Membre",
      RESPONSABLE: "Responsable",
      ADMIN: "Administrateur",
    }[viewer.role]
    : "Mode découverte";

  return (
    <details className="relative">
      <summary
        aria-label={`Profil de ${name}`}
        className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl p-1.5 text-left outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-32 truncate text-sm font-medium text-slate-800">
            {name}
          </span>
          <span className="block text-xs text-slate-500">{roleLabel}</span>
        </span>
        <AppIcon className="hidden size-4 text-slate-400 sm:block" name="chevron-down" />
      </summary>
      <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        {viewer ? (
          <>
            <p className="mt-1 truncate text-xs text-slate-500">{viewer.email}</p>
            <Badge className="mt-3" variant="neutral">{roleLabel}</Badge>
            <form action={logoutAction} className="mt-4 border-t border-slate-100 pt-3">
              <button
                className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                type="submit"
              >
                Se déconnecter
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Connectez-vous ou créez un compte pour participer à la vie de votre communauté.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                className={buttonClassName("secondary", "sm")}
                href="/login"
              >
                Connexion
              </Link>
              <Link
                className={buttonClassName("primary", "sm")}
                href="/register"
              >
                Inscription
              </Link>
            </div>
          </>
        )}
      </div>
    </details>
  );
}

export function AppShell({
  children,
  viewer = null,
  activePath = "/",
}: {
  readonly children: ReactNode;
  readonly viewer?: AppViewer | null;
  readonly activePath?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <Sidebar activePath={activePath} viewer={viewer} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <MobileNavigation activePath={activePath} viewer={viewer} />
              <div className="lg:hidden">
                <Brand compact />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-slate-800">
                  Bienvenue dans votre espace
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Ensemble, améliorons notre cadre de vie.
                </p>
              </div>

              <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
                <div className="relative hidden w-56 md:block xl:w-72">
                  <AppIcon
                    className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                    name="search"
                  />
                  <label className="sr-only" htmlFor="global-search">
                    Rechercher
                  </label>
                  <Input
                    className="pl-10"
                    id="global-search"
                    placeholder="Rechercher..."
                    type="search"
                  />
                </div>
                <NotificationsMenu />
                {!viewer && (
                  <nav aria-label="Compte" className="hidden items-center gap-1 sm:flex">
                    <Link
                      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      href="/login"
                    >
                      Connexion
                    </Link>
                    <Link
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                      href="/register"
                    >
                      Créer un compte
                    </Link>
                  </nav>
                )}
                <ProfileMenu viewer={viewer} />
              </div>
            </div>
          </header>

          <main
            className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
            id="main-content"
          >
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
