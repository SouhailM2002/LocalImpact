export function RouteLoadingState({ label }: { readonly label: string }) {
  return (
    <main
      aria-busy="true"
      aria-label={`Chargement : ${label}`}
      className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8"
    >
      <div aria-hidden="true" className="h-4 w-36 animate-pulse bg-slate-200" />
      <div aria-hidden="true" className="h-9 w-72 max-w-full animate-pulse bg-slate-200" />
      <div aria-hidden="true" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="h-52 animate-pulse bg-slate-100" key={index} />
        ))}
      </div>
      <p className="sr-only" role="status">Chargement en cours.</p>
    </main>
  );
}
