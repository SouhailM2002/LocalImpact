"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@localimpact/application";

import { AppIcon, type AppIconName } from "./app-icon";

interface NavigationItem {
  readonly href: string;
  readonly label: string;
  readonly icon: AppIconName;
}

const sharedNavigation: readonly NavigationItem[] = [
  { href: "/", label: "Tableau de bord", icon: "dashboard" },
  { href: "/reports", label: "Explorer les signalements", icon: "search" },
  { href: "/accessibility", label: "Suivi de l’accessibilité", icon: "activity" },
];

const roleNavigation: Readonly<Record<UserRole, readonly NavigationItem[]>> = {
  USER: [
    { href: "/reports/new", label: "Créer un signalement", icon: "plus" },
  ],
  RESPONSABLE: [
    { href: "/responsable", label: "Mes interventions", icon: "activity" },
  ],
  ADMIN: [
    { href: "/admin", label: "Administration", icon: "dashboard" },
  ],
};

function NavigationList({
  viewer,
  activePath,
}: {
  readonly viewer: { readonly role: UserRole } | null;
  readonly activePath: string;
}) {
  const items = [
    ...sharedNavigation,
    ...(viewer ? roleNavigation[viewer.role] : []),
  ];

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = item.href === "/"
          ? activePath === "/"
          : activePath === item.href || activePath.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              aria-current={isActive ? "page" : undefined}
              className={[
                "group flex min-h-11 items-center gap-3 border-l-4 px-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-[#1F4FD8] bg-blue-50 text-slate-950"
                  : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")}
              href={item.href}
            >
              <AppIcon
                className={[
                  "size-[18px] shrink-0",
                  isActive ? "text-[#1F4FD8]" : "text-slate-500 group-hover:text-slate-700",
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

function ActiveNavigationList({
  viewer,
}: {
  readonly viewer: { readonly role: UserRole } | null;
}) {
  return <NavigationList activePath={usePathname()} viewer={viewer} />;
}

export function NavigationLinks({
  viewer,
}: {
  readonly viewer: { readonly role: UserRole } | null;
}) {
  return (
    <Suspense fallback={<NavigationList activePath="/" viewer={viewer} />}>
      <ActiveNavigationList viewer={viewer} />
    </Suspense>
  );
}
