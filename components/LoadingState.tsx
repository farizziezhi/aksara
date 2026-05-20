export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-3 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
    >
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      <p>Mencari paper di OpenAlex, CORE, arXiv, DOAJ...</p>
    </div>
  );
}
