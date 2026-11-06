import { Link } from "@tanstack/react-router";
import { site, getService } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";

const { workSection } = site.home;

// Selected work (Phase 4b, section 6) — placeholder cards until real case
// studies exist (titles/summaries are TODO(AB), no invented client names). The
// image area is a neutral Fog block with a fixed aspect-ratio so it reserves
// its space and never shifts layout. Ink surface, grid 1 / 2 / 3, fully SSR.
//
// Phase 4c fix: a card whose title is still the "TODO(AB)" placeholder renders
// with NO link (no <a>, no /work/{slug} href) — only the "All work" link stays.
// Once real titles land, each card becomes a link automatically.
const PLACEHOLDER = "TODO(AB)";

export function HomeWork() {
  return (
    <section
      id="selected-work"
      aria-labelledby="selected-work-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{workSection.eyebrow}</Eyebrow>
            <h2
              id="selected-work-title"
              className="mt-5 font-display text-3xl text-paper sm:text-4xl"
            >
              {workSection.title}
            </h2>
          </div>
          <Link
            to="/work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:text-vermilion"
          >
            {workSection.allLabel}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>

        <ol className="mt-12 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.work.map((item) => {
            const isPlaceholder = item.title === PLACEHOLDER;
            // Card chip = the service line(s) this project demonstrates, resolved
            // from slugs so the label always matches the canonical service name.
            const category = item.services
              .map((slug) => getService(slug)?.name)
              .filter(Boolean)
              .join(", ");
            const cardClass = `group flex h-full flex-col border border-line ${
              isPlaceholder
                ? ""
                : "transition-colors hover:border-line-strong focus-visible:border-line-strong"
            }`;
            const inner = (
              <>
                {/* Fixed-ratio Fog placeholder — reserves space, zero CLS. */}
                <span aria-hidden className="block aspect-[4/3] w-full bg-fog" />
                <span className="flex flex-1 flex-col p-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                    {category}
                  </span>
                  <span className="mt-3 font-display text-lg text-paper">{item.title}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-graphite">
                    {item.summary}
                  </span>
                  {!isPlaceholder && (
                    <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors group-hover:text-vermilion">
                      View project
                      <span aria-hidden>&rarr;</span>
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <Reveal as="li" key={item.slug} className="h-full">
                {isPlaceholder ? (
                  <div className={cardClass}>{inner}</div>
                ) : (
                  <Link to="/work/$slug" params={{ slug: item.slug }} className={cardClass}>
                    {inner}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
