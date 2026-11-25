"use client";

import { useActionState } from "react";
import { Button, Card, Textarea } from "@localimpact/ui";

import { addCommentAction } from "@/app/reports/actions";
import type { AddCommentFormState } from "./add-comment-form-state";

const initialState: AddCommentFormState = {
  message: "",
  success: false,
};

export function AddCommentForm({ signalementId }: { readonly signalementId: string }) {
  const [state, formAction, pending] = useActionState(addCommentAction, initialState);

  return (
    <section aria-labelledby="add-comment-title" className="space-y-3">
      <h2
        className="border-t-4 border-slate-950 pt-4 text-2xl font-black text-slate-950"
        id="add-comment-title"
      >
        Ajouter un commentaire
      </h2>
      <Card className="border-2 border-slate-900 p-4 sm:p-5">
        <form action={formAction} className="space-y-3">
          <input name="signalementId" type="hidden" value={signalementId} />
          <div>
            <label
              className="mb-1.5 block text-sm font-bold text-slate-900"
              htmlFor="report-comment"
            >
              Votre commentaire
            </label>
            <Textarea
              autoComplete="off"
              id="report-comment"
              name="content"
              placeholder="Partagez des informations utiles à la communauté."
              required
              rows={4}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={pending} type="submit">
              {pending ? "Publication…" : "Publier le commentaire"}
            </Button>
            {state.message && (
              <p
                aria-live="polite"
                className={state.success ? "text-sm text-emerald-800" : "text-sm text-rose-700"}
                role={state.success ? "status" : "alert"}
              >
                {state.message}
              </p>
            )}
          </div>
        </form>
      </Card>
    </section>
  );
}
