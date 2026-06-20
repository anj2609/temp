interface IconProps {
  size?: number;
  className?: string;
}

function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function SunIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1.5M12 19.5V21M4.2 4.2l1 1M18.8 18.8l1 1M3 12h1.5M19.5 12H21M4.2 19.8l1-1M18.8 5.2l1-1" />
    </svg>
  );
}

export function MoonIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />
    </svg>
  );
}

export function CrownIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M4 9l3.5 2.6L12 5.5l4.5 6.1L20 9l-1.6 9.5H5.6L4 9z" />
    </svg>
  );
}

export function QrIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2.5v2.5M20.5 14.5v.01M14.5 20.5v.01M17.5 20.5h3v-3" />
    </svg>
  );
}

export function UndoIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M9 13l-4-4 4-4" />
      <path d="M5 9h10a4 4 0 0 1 0 8h-2" />
    </svg>
  );
}

export function RedoIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M15 13l4-4-4-4" />
      <path d="M19 9H9a4 4 0 0 0 0 8h2" />
    </svg>
  );
}

export function WalletIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M3 8a2 2 0 0 1 2-2h11.5a1 1 0 0 1 1 1v1" />
      <path d="M3 8v9a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z" />
      <circle cx="16" cy="13.5" r="1" />
    </svg>
  );
}

export function TrendingUpIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

export function ReceiptIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.6z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}
