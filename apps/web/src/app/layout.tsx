import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";

import { AppShell } from "../components/app-shell";
import { RouteShell } from "../components/route-shell";
import { RouteLoadingState } from "../components/route-loading-state";
import { container } from "../container";
import { getAuthenticatedUser } from "../lib/auth-session";
import "leaflet/dist/leaflet.css";
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

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <Suspense fallback={<RouteLoadingState label="votre espace LocalImpact" />}>
          <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
        </Suspense>
      </body>
    </html>
  );
}

async function AuthenticatedAppShell({ children }: { readonly children: ReactNode }) {
  const viewer = await getAuthenticatedUser();
  const notificationFeed = viewer === null
    ? undefined
    : await container.getNotificationsForUser.execute({
      userId: viewer.id,
      limit: 5,
    });
  const appShell = (
    <AppShell notificationFeed={notificationFeed} viewer={viewer}>
      {children}
    </AppShell>
  );

  return (
    <Suspense fallback={appShell}>
      <RouteShell appShell={appShell} barePage={children} />
    </Suspense>
  );
}
