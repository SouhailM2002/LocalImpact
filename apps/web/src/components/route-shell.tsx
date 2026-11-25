"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function RouteShell({
  appShell,
  barePage,
}: {
  readonly appShell: ReactNode;
  readonly barePage: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") {
    return barePage;
  }

  return appShell;
}
