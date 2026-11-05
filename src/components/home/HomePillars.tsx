import { Link } from "@tanstack/react-router";
import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";

const { pillars } = site.home;

// Brand / Site / App — picks up the hero's Brand./Site./App. stages (same
// vermilion full-stop) and routes each to its closest locked service page.
// Ink surface; copy comes entirely from site.ts. No content-visibility here:
// this is light SSR text that renders at its real height from first paint, so
// there is nothing to reserve and zero layout shift.
export function HomePillars() {
  return (
    <section
      id="pillars"
      aria-labelledby="pillars-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>{pillars.eyebrow}</Eyebrow>
        <h2
          id="pillars-title"
          className="mt-5 max-w-2xl font-display text-3xl text-paper sm:text-4xl"
        >
          {pillars.title}
        </h2>

        <ol className="mt-12 grid list-none gap-px border border-line bg-line sm:grid-cols-3">
          {pillars.items.map((item) => (
            <Reveal as="li" key={item.index}>
              <Link
                to="/services/$slug"
                params={{ slug: item.slug }}
                className="group flex h-full flex-col bg-ink p-8 transition-colors hover:bg-fog focus-visible:bg-fog"
              >
                <span className="font-mono text-sm text-graphite">{item.index}</span>
                <h3 className="mt-6 font-display text-2xl text-paper">
                  {item.title}
                  <span className="text-vermilion">.</span>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite">
                  {item.body}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors group-hover:text-vermilion">
                  {item.linkLabel}
                  <span aria-hidden>&rarr;</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
