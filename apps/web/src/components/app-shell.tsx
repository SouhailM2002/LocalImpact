import type { ReactNode } from "react";
import Link from "next/link";
import type { UserRole } from "@localimpact/application";
import { Badge, Card, Input, buttonClassName } from "@localimpact/ui";

import { NavigationLinks } from "./navigation-links";
import { logoutAction } from "../features/auth/actions";
import { AppIcon } from "./app-icon";

export interface AppViewer {
  readonly displayName: string;
  readonly email: string;
  readonly role: UserRole;
}

function Brand() {
  return (
    <Link
      aria-label="LocalImpact, accueil"
      className="inline-flex items-center gap-3"
      href="/"
    >
      <span aria-hidden="true" className="flex size-10 items-center justify-center bg-[#1F4FD8]">
        <span className="size-4 bg-white" />
      </span>
      <span className="text-lg font-black tracking-tight text-slate-950">
        Local<span className="text-[#1F4FD8]">Impact</span>
      </span>
    </Link>
  );
}

function Sidebar({
  viewer,
}: {
  readonly viewer: AppViewer | null;
}) {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r-2 border-slate-900 bg-white px-5 py-6 lg:flex">
      <Brand />
      <p className="mb-9 mt-3 pl-1 text-xs leading-5 text-slate-600">
        Agir ensemble pour un meilleur cadre de vie.
      </p>

      <p className="mb-3 border-b-2 border-slate-900 px-3 pb-2 text-[11px] font-bold tracking-[0.14em] text-slate-600 uppercase">
        Espace de travail
      </p>
      <nav aria-label="Navigation principale">
        <NavigationLinks viewer={viewer} />
      </nav>

      <div className="mt-auto pt-8">
        <Card className="border-2 border-slate-900 bg-blue-50 p-4">
          <div className="mb-2 flex size-9 items-center justify-center bg-[#1F4FD8] text-white">
            <AppIcon className="size-[18px]" name="sparkles" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Votre voix compte
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Chaque signalement aide la communauté à avancer.
          </p>
        </Card>
        <p className="mt-5 px-1 text-xs text-slate-500">
          LocalImpact · Espace communautaire
        </p>
      </div>
    </aside>
  );
}

function MobileNavigation({
  viewer,
}: {
  readonly viewer: AppViewer | null;
}) {
  return (
    <details className="relative lg:hidden">
      <summary
        aria-label="Ouvrir la navigation"
        className={`${buttonClassName("secondary", "icon")} list-none cursor-pointer`}
      >
        <AppIcon className="size-5" name="menu" />
      </summary>
      <div className="absolute left-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] border-2 border-slate-900 bg-white p-3 shadow-lg shadow-slate-950/10">
        <div className="mb-3 px-3 py-2">
          <Brand />
        </div>
        <nav aria-label="Navigation mobile">
          <NavigationLinks viewer={viewer} />
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
        <span className="absolute right-2.5 top-2.5 size-2 bg-[#1F4FD8] ring-2 ring-white" />
      </summary>
      <div className="absolute right-0 top-12 z-50 w-72 border-2 border-slate-900 bg-white p-4 shadow-lg shadow-slate-950/10">
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
        className="flex min-h-10 cursor-pointer list-none items-center gap-2 border border-transparent p-1.5 text-left outline-none transition-colors hover:bg-slate-100 focus-visible:border-[#1F4FD8]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center bg-blue-100 text-xs font-bold text-blue-900">
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
      <div className="absolute right-0 top-12 z-50 w-64 border-2 border-slate-900 bg-white p-4 shadow-lg shadow-slate-950/10">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        {viewer ? (
          <>
            <p className="mt-1 truncate text-xs text-slate-500">{viewer.email}</p>
            <Badge className="mt-3" variant="neutral">{roleLabel}</Badge>
            <form action={logoutAction} className="mt-4 border-t border-slate-100 pt-3">
              <button
                className="w-full px-2 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FD8]"
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
}: {
  readonly children: ReactNode;
  readonly viewer?: AppViewer | null;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <Sidebar viewer={viewer} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b-2 border-slate-900 bg-white">
            <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <MobileNavigation viewer={viewer} />
              <div className="lg:hidden">
                <Brand />
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
                <form action="/reports" className="relative hidden w-56 md:block xl:w-72" method="get">
                  <AppIcon
                    className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-500"
                    name="search"
                  />
                  <label className="sr-only" htmlFor="global-search">
                    Rechercher les signalements
                  </label>
                  <Input
                    className="pl-10"
                    id="global-search"
                    name="keyword"
                    placeholder="Rechercher..."
                    type="search"
                  />
                </form>
                <NotificationsMenu />
                {!viewer && (
                  <nav aria-label="Compte" className="hidden items-center gap-1 sm:flex">
                    <Link
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      href="/login"
                    >
                      Connexion
                    </Link>
                    <Link
                      className="px-3 py-2 text-sm font-bold text-[#1F4FD8] hover:bg-blue-50"
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
