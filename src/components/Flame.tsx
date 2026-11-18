export function Flame({ className = "", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 40"
      aria-hidden="true"
      className={`${animated ? "animate-flicker origin-bottom" : ""} ${className}`}
    >
      <defs>
        <linearGradient id="flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="55%" stopColor="#ff5a1f" />
          <stop offset="100%" stopColor="#ff8a2a" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff8a2a" />
          <stop offset="100%" stopColor="#f5c542" />
        </linearGradient>
      </defs>
      <path
        d="M17 1c1.6 7.4 11 11.2 11 23.2C28 32.4 22.6 39 16 39S4 32.4 4 24.6c0-5.6 2.7-9.4 5.6-12.1 0 4.6 1.8 7.4 4.5 8.4C12.4 13.4 15.3 6.4 17 1z"
        fill="url(#flame-outer)"
      />
      <path
        d="M16 20.5c1 4.6 5.6 6.2 5.6 11.4A5.6 5.6 0 0 1 16 37.5a5.6 5.6 0 0 1-5.6-5.6c0-3.8 2.8-6.6 5.6-11.4z"
        fill="url(#flame-inner)"
      />
    </svg>
  );
}

export function EmberGlow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 -z-0 h-[48rem] overflow-hidden ${className}`}>
      <div
        className="animate-glow absolute left-1/2 top-[-18rem] h-[42rem] w-[60rem] max-w-[160vw] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,90,31,0.28), rgba(255,90,31,0.10) 45%, rgba(14,12,11,0) 75%)",
        }}
      />
    </div>
  );
}
