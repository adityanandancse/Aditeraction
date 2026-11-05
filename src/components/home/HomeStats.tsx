import { site } from "~/lib/site";
import { Reveal } from "~/components/motion/Reveal";

const { stats } = site.home;

// At a glance — Paper surface (demonstrates the light surface at AA). On Paper,
// Graphite fails AA for small text, so every label and value uses Ink; the note
// uses Ink at 70% (still > 4.5:1). Values are placeholders until real figures
// are supplied — see the TODO(AB) markers below. Fully SSR, no layout shift.
export function HomeStats() {
  return (
    <section
      id="at-a-glance"
      aria-labelledby="at-a-glance-title"
      className="border-t border-line bg-paper text-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        {/* Eyebrow is inlined (not the shared component): on Paper the label must
            be Ink, not the component's Graphite, to hold AA at this size. */}
        <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] text-ink">
          <span aria-hidden className="inline-block size-2 shrink-0 bg-vermilion" />
          {stats.eyebrow}
        </p>
        <h2
          id="at-a-glance-title"
          className="mt-5 font-display text-3xl text-ink sm:text-4xl"
        >
          {stats.title}
        </h2>

        <ul className="mt-12 grid list-none gap-px border border-line-strong bg-line-strong sm:grid-cols-2 lg:grid-cols-4">
          {stats.items.map((item) => (
            <Reveal as="li" key={item.label} className="bg-paper p-8">
              {/* TODO(AB): real figure — placeholder em-dash until confirmed. */}
              <p
                className="font-display text-5xl text-ink"
                aria-hidden={item.value === "—"}
              >
                {item.value}
              </p>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-ink">
                {item.label}
              </p>
            </Reveal>
          ))}
        </ul>

        <p className="mt-8 max-w-md text-sm leading-relaxed text-ink/70">{stats.note}</p>
      </div>
    </section>
  );
}
