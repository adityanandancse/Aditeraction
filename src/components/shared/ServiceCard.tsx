import { Link } from "@tanstack/react-router";
import type { ServiceDef } from "~/lib/site";

// The service card used by both the home Services grid and the /services hub, so
// the two never drift. Mono index, title, summary, who-it's-for, the full
// deliverables list and a "View service" affordance. Links to /services/{slug}.
// Renders an <h3> → it must sit under a section <h2> wherever it's used.
export function ServiceCard({ service, index }: { service: ServiceDef; index: number }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group flex h-full flex-col bg-ink p-8 transition-colors hover:bg-fog focus-visible:bg-fog"
    >
      <span className="font-mono text-sm text-graphite">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-6 font-display text-xl text-paper">{service.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-graphite">{service.summary}</p>
      <p className="mt-2 text-sm leading-relaxed text-graphite/80">{service.forWho}</p>

      <ul className="mt-6 flex flex-1 flex-col gap-1.5 border-t border-line pt-6">
        {service.deliverables.map((d) => (
          <li key={d} className="flex items-start gap-2 text-sm text-paper/80">
            <span aria-hidden className="mt-2 size-1 shrink-0 bg-line-strong" />
            {d}
          </li>
        ))}
      </ul>

      <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors group-hover:text-vermilion">
        View service
        <span aria-hidden>&rarr;</span>
      </span>
    </Link>
  );
}
