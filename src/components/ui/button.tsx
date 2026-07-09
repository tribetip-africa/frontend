import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "dark";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md font-bold",
  gold: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md font-bold",
  secondary:
    "bg-surface text-ink border-2 border-line hover:border-brand-200 hover:bg-sand font-semibold",
  ghost: "text-ink-soft hover:bg-sand font-medium",
  dark: "bg-ink text-white hover:bg-ink-soft font-bold",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
