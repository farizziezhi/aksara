interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
    >
      <p className="font-medium">Tidak dapat memuat hasil</p>
      <p className="mt-1">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900/40"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}
