// Minimal premium line-icon set (no external icon dependency).
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const Play = ({ className = "", size = 18 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M6 4.5v15l13-7.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const Plus = ({ className = "", size = 18 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Check = ({ className = "", size = 18 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export const Star = ({ className = "", size = 14 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77 6.8 19.5l.99-5.79-4.21-4.1 5.82-.85z"
      fill="currentColor"
    />
  </svg>
);

export const Search = ({ className = "", size = 18 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const Close = ({ className = "", size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Arrow = ({ className = "", size = 18 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ChevronL = ({ className = "", size = 22 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const ChevronR = ({ className = "", size = 22 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const Google = ({ className = "", size = 18 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.21-4.74 3.21-8.33z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/>
  </svg>
);

export const Clock = ({ className = "", size = 14 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const Sparkle = ({ className = "", size = 16 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"
      fill="currentColor"
    />
  </svg>
);

export const Menu = ({ className = "", size = 22 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
