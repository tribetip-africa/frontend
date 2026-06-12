import Link from "next/link";

type LogoProps = {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
};

function LogoMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
      <rect width="40" height="40" rx="12" fill="#f5b942" />
      <path
        d="M12 26c2-5 6-8 8-8s6 3 8 8"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <ellipse cx="20" cy="17" rx="7" ry="5" fill="#fff8e6" stroke="#1a1a1a" strokeWidth="1.8" />
      <path d="M17 17h6" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const textSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export function Logo({
  href = "/",
  variant = "dark",
  size = "md",
  className = "",
}: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-ink";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`shrink-0 ${sizeClasses[size]}`}>
        <LogoMark />
      </span>
      <span className={`font-display font-bold tracking-tight ${textColor} ${textSizes[size]}`}>
        TribeTip
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex transition-opacity hover:opacity-85">
      {content}
    </Link>
  );
}
