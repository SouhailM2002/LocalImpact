import type { CommentaireDetailDto } from "@localimpact/application";
import { Card } from "@localimpact/ui";

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function ReportComments({
  comments,
}: {
  readonly comments: readonly CommentaireDetailDto[];
}) {
  return (
    <section aria-labelledby="comments-title" className="space-y-3">
      <h2 className="border-t-4 border-slate-950 pt-4 text-2xl font-black text-slate-950" id="comments-title">
        Commentaires et discussion
      </h2>
      {comments.length === 0 ? (
        <Card className="p-5 text-sm leading-6 text-slate-600">
          Aucun commentaire pour le moment.
        </Card>
      ) : (
        <ol className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Card className="border-l-4 border-l-slate-950 p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-bold text-slate-950">
                    {comment.authorDisplayName ?? "Compte indisponible"}
                  </p>
                  <time
                    className="text-xs text-slate-500"
                    dateTime={comment.createdAt.toISOString()}
                  >
                    {formatDateTime(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {comment.content}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
