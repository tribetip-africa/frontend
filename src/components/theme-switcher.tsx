"use client";

import { useTheme } from "@/context/theme-context";
import type { ThemePreference } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
        d="M12 2.5v2.25M12 19.25V21.5M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.25M19.25 12H21.5M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        d="M19 13.2A7.5 7.5 0 0 1 10.8 5 6.2 6.2 0 1 0 19 13.2Z"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="12"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" d="M9 20.5h6" />
    </svg>
  );
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  switch (preference) {
    case "dark":
      return <MoonIcon />;
    case "system":
      return <SystemIcon />;
    default:
      return <SunIcon />;
  }
}

type ThemeSwitcherProps = {
  className?: string;
};

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const { preference, label, cyclePreference } = useTheme();

  return (
    <button
      type="button"
      onClick={cyclePreference}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition hover:border-brand-200 hover:bg-sand hover:text-ink ${className}`}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <ThemeIcon preference={preference} />
    </button>
  );
}
