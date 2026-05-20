export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-card bg-subtle-cream py-16 text-center"
    >
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-sky-teal" />
      <p className="text-body-sm text-ash-gray">
        Mencari paper di OpenAlex, CORE, arXiv, DOAJ, Crossref, Europe PMC...
      </p>
    </div>
  );
}
