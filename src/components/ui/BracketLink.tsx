import { createLink } from "@tanstack/react-router";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";

// `< label >` — brackets in graphite, label + brackets turn vermilion on hover.
// Echoes the code-nib mark (brackets = engineering). Built with createLink so
// TanStack's typed `to` → `params` inference is preserved for dynamic routes.
const BracketAnchor = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ children, className = "", ...rest }, ref) => (
    <a
      ref={ref}
      className={`group inline-flex items-center gap-1 font-mono text-sm text-paper transition-colors hover:text-vermilion ${className}`}
      {...rest}
    >
      <span aria-hidden className="text-graphite transition-colors group-hover:text-vermilion">
        {"<"}
      </span>
      <span>{children}</span>
      <span aria-hidden className="text-graphite transition-colors group-hover:text-vermilion">
        {">"}
      </span>
    </a>
  ),
);
BracketAnchor.displayName = "BracketAnchor";

export const BracketLink = createLink(BracketAnchor);
