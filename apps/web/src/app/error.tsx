"use client";

import { RouteErrorState } from "../components/route-error-state";

export default function Error({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  return <RouteErrorState error={error} reset={reset} />;
}
