import Link from "next/link";
import {
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import type {
  ActorContext,
  SignalementDetailDto,
} from "@localimpact/application";
import { Card } from "@localimpact/ui";

import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { ReportDetailView } from "@/features/signalements/report-detail-view";

export default async function SignalementDetailPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [routeParams, query, user] = await Promise.all([
    params,
    searchParams,
    getAuthenticatedUser(),
  ]);

  if (user === null || !/^[a-zA-Z0-9_-]{1,128}$/.test(routeParams.id)) {
    return <SignalementUnavailable />;
  }

  const detail = await loadSignalementDetail(
    { userId: user.id, role: user.role },
    routeParams.id,
  );
  if (detail === null) {
    return <SignalementUnavailable />;
  }

  return (
    <ReportDetailView
      detail={detail}
      viewerId={user.id}
      wasJustCreated={query.created === "1"}
    />
  );
}

async function loadSignalementDetail(
  actor: ActorContext,
  signalementId: string,
): Promise<SignalementDetailDto | null> {
  try {
    return await container.getSignalementDetail.execute({
      actor,
      signalementId,
    });
  } catch (error) {
    if (
      error instanceof SignalementNotFoundError ||
      error instanceof UnauthorizedDomainOperationError
    ) {
      return null;
    }
    throw error;
  }
}

function SignalementUnavailable() {
  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
      <h1 className="text-xl font-semibold text-slate-950">
        Signalement indisponible
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Ce signalement est introuvable ou votre compte n’y a pas accès.
      </p>
      <Link
        className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
        href="/reports"
      >
        Retour aux signalements
      </Link>
    </Card>
  );
}
