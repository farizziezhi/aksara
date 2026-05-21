import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="font-caveat text-[24px] text-sky-teal">halaman hilang</p>
      <h1 className="mt-4 text-heading-lg font-semibold tracking-tight text-ink-black md:text-display">
        404
      </h1>
      <p className="mt-4 max-w-md text-body text-deep-slate">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-pill bg-button-black px-5 py-2.5 text-body-sm text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90"
      >
        Kembali ke pencarian
      </Link>
    </div>
  );
}
