import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

// Primary = Vermilion background + INK text (white-on-vermilion fails contrast).
// Secondary = Paper outline on Ink. Square corners, mono uppercase label.
const VARIANTS = {
  primary: "bg-vermilion text-ink hover:bg-[#e8442a]",
  secondary: "bg-transparent text-paper border border-line-strong hover:border-paper",
} as const;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-vermilion";

type Variant = keyof typeof VARIANTS;

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...linkProps
}: { variant?: Variant; className?: string; children: ReactNode } & Omit<
  ComponentProps<typeof Link>,
  "className" | "children"
>) {
  return (
    <Link {...linkProps} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
