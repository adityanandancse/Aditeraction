import { Link } from "@tanstack/react-router";

export interface Crumb {
  label: string;
  to?: string; // omitted on the current (last) page
}

// Visible breadcrumb trail — mirrors the URL path (01-site-architecture.md §6).
// Not rendered on Home. JSON-LD BreadcrumbList is added in Phase 7.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-[0.1em] text-graphite">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors hover:text-vermilion">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-paper">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden className="text-line-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
