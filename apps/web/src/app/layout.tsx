import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";

import { AppShell } from "../components/app-shell";
import { RouteShell } from "../components/route-shell";
import { getAuthenticatedUser } from "../lib/auth-session";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LocalImpact",
    template: "%s | LocalImpact",
  },
  description:
    "Signalez les problèmes de votre campus ou résidence et suivez leur résolution.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const viewer = await getAuthenticatedUser();
  const appShell = <AppShell viewer={viewer}>{children}</AppShell>;

  return (
    <html lang="fr">
      <body>
        <Suspense fallback={appShell}>
          <RouteShell appShell={appShell} barePage={children} />
        </Suspense>
      </body>
    </html>
  );
}
