import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { AppShell } from "../components/app-shell";
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
