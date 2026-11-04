import type { ReactNode } from "react";

// Fog surface, 1px line border. The top-right corner square fills Vermilion on
// hover (one accent moment). No gradient, no glow.
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative border border-line bg-fog p-6 transition-colors hover:border-line-strong ${className}`}
    >
      <span
        aria-hidden
        className="absolute right-0 top-0 size-2 bg-line-strong transition-colors group-hover:bg-vermilion"
      />
      {children}
    </div>
  );
}
