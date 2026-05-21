interface Props {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

export function Logo({ size = 28, className, withWordmark = true }: Props) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Glyph size={size} />
      {withWordmark ? (
        <span className="text-body font-semibold tracking-tight text-ink-black">
          Aksara
        </span>
      ) : null}
    </span>
  );
}

export function Glyph({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="0" y="0" width="32" height="32" rx="9" fill="#0d111b" />
      <path
        d="M9.5 22V11.5C9.5 10.6716 10.1716 10 11 10H17.5C19.7091 10 21.5 11.7909 21.5 14C21.5 16.2091 19.7091 18 17.5 18H13"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="22.5" cy="22.5" r="3" stroke="#0098f2" strokeWidth="2" />
      <path
        d="M24.6 24.6L26.5 26.5"
        stroke="#0098f2"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
