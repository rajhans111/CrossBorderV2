/**
 * Original mark for the Xinto wordmark — a bridge/arc between two piers,
 * echoing this product's underlying "Setu" (bridge) concept. Deliberately
 * distinct from any third-party logo: no crossing letterforms, no swoosh.
 */
export function XintoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="xinto-mark-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#xinto-mark-gradient)" />
      <path d="M7 21c0-5.2 4-9.5 9-9.5s9 4.3 9 9.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="22.2" r="1.7" fill="white" />
      <circle cx="25" cy="22.2" r="1.7" fill="white" />
    </svg>
  );
}
