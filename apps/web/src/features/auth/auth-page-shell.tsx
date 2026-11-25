import type { ReactNode } from "react";
import { Badge } from "@localimpact/ui";

import { AppIcon, type AppIconName } from "@/components/app-icon";

export function AuthPageShell({
  eyebrow,
  icon,
  title,
  intro,
  panelHeadline,
  panelDescription,
  children,
}: {
  readonly eyebrow: string;
  readonly icon: AppIconName;
  readonly title: string;
  readonly intro: string;
  readonly panelHeadline: ReactNode;
  readonly panelDescription: string;
  readonly children: ReactNode;
}) {
  return (
    <main className="min-h-svh bg-white">
      <section className="grid min-h-svh md:grid-cols-12">
        <aside className="flex flex-col justify-center bg-[#1F4FD8] px-5 py-3 text-white sm:px-8 md:col-span-5 md:min-h-svh md:justify-between md:gap-10 md:px-10 md:py-12 lg:px-14 xl:px-16">
          <p className="flex items-center gap-3 text-xl font-black tracking-tight">
            <span aria-hidden="true" className="size-5 bg-white" />
            LocalImpact
          </p>
          <div className="hidden max-w-lg py-2 md:block md:py-10">
            <p className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {panelHeadline}
            </p>
            <p className="mt-6 max-w-sm text-base leading-7 text-blue-50 sm:text-lg">
              {panelDescription}
            </p>
          </div>
          <p className="hidden text-xs font-bold tracking-[0.16em] text-blue-100 uppercase md:block">
            Agir ensemble, concrètement.
          </p>
        </aside>

        <div className="flex items-center px-5 py-4 sm:px-10 md:col-span-7 md:min-h-svh md:px-12 md:py-4 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            <Badge className="mb-2 sm:mb-4" variant="info">
              <AppIcon className="size-3.5" name={icon} />
              {eyebrow}
            </Badge>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-700 sm:mt-3 sm:text-base">
              {intro}
            </p>
            <div className="mt-4 sm:mt-6">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
