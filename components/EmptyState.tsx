import type { ReactNode } from "react";

interface Props {
  title: string;
  body: ReactNode;
  illustration: "search" | "empty";
}

export function EmptyState({ title, body, illustration }: Props) {
  return (
    <div className="rounded-card border border-dashed border-hairline bg-subtle-cream px-6 py-16 text-center">
      <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
        {illustration === "search" ? <SearchArt /> : <EmptyArt />}
      </div>
      <p className="font-caveat text-[20px] text-graphite">{title}</p>
      <div className="mx-auto mt-3 max-w-md text-body-sm text-ash-gray">
        {body}
      </div>
    </div>
  );
}

function SearchArt() {
  return (
    <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="22" y="22" width="68" height="80" rx="10" fill="#ffffff" stroke="#ececec" strokeWidth="2" />
      <line x1="34" y1="42" x2="78" y2="42" stroke="#ececec" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="54" x2="68" y2="54" stroke="#ececec" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="66" x2="74" y2="66" stroke="#ececec" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="78" x2="60" y2="78" stroke="#ececec" strokeWidth="2" strokeLinecap="round" />
      <circle cx="88" cy="86" r="16" fill="#ffffff" stroke="#0098f2" strokeWidth="3" />
      <line x1="100" y1="98" x2="112" y2="110" stroke="#0098f2" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function EmptyArt() {
  return (
    <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="64" cy="64" r="44" fill="#ffffff" stroke="#ececec" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M48 70c4 6 12 10 16 10s12-4 16-10" stroke="#8d8d8d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="56" r="3" fill="#0d111b" />
      <circle cx="76" cy="56" r="3" fill="#0d111b" />
      <circle cx="100" cy="36" r="6" fill="#0098f2" opacity="0.2" />
      <circle cx="28" cy="92" r="4" fill="#f200ca" opacity="0.2" />
    </svg>
  );
}
