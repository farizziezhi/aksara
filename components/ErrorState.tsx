interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="rounded-card border border-hairline bg-canvas-white p-6 shadow-[var(--shadow-subtle)]"
    >
      <p className="text-subheading font-semibold text-ink-black">Tidak dapat memuat hasil</p>
      <p className="mt-2 text-body-sm text-deep-slate">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center rounded-pill bg-button-black px-[14px] py-[6px] text-body-sm font-medium text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}
