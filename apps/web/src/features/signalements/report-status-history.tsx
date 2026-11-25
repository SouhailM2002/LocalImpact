import type { HistoriqueStatutDetailDto } from "@localimpact/application";
import { Badge, Card } from "@localimpact/ui";

const statusLabels = {
  NOUVEAU: "Nouveau",
  PRIS_EN_CHARGE: "Pris en charge",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
} as const;

const statusVariants = {
  NOUVEAU: "info",
  PRIS_EN_CHARGE: "warning",
  EN_COURS: "warning",
  RESOLU: "success",
} as const;

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function ReportStatusHistory({
  history,
}: {
  readonly history: readonly HistoriqueStatutDetailDto[];
}) {
  return (
    <section aria-labelledby="status-history-title" className="space-y-3">
      <h2 className="border-t-4 border-slate-950 pt-4 text-2xl font-black text-slate-950" id="status-history-title">
        Historique des statuts
      </h2>
      {history.length === 0 ? (
        <Card className="p-5 text-sm leading-6 text-slate-600">
          Aucune transition de statut n’a encore été enregistrée.
        </Card>
      ) : (
        <ol className="space-y-3">
          {history.map((item) => (
            <li key={item.id}>
              <Card className="border-l-4 border-l-slate-950 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariants[item.previousStatus]}>
                      {statusLabels[item.previousStatus]}
                    </Badge>
                    <span aria-hidden="true" className="text-slate-400">→</span>
                    <Badge variant={statusVariants[item.newStatus]}>
                      {statusLabels[item.newStatus]}
                    </Badge>
                  </div>
                  <time
                    className="text-xs text-slate-500"
                    dateTime={item.changedAt.toISOString()}
                  >
                    {formatDateTime(item.changedAt)}
                  </time>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Par {item.authorDisplayName ?? "Compte indisponible"}
                </p>
                {item.interventionDescription && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {item.interventionDescription}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
