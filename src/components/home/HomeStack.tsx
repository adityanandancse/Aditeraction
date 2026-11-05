import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";

const { stack } = site;

// Stack (Phase 4b, section 5) — text only, no logos or icons. One row per
// category rendered as a <dl> (dt = category in mono/graphite, dd = items as
// compact chips). All visible at once — no carousel, no marquee. On mobile the
// category stacks above its wrapping chips. Ink surface, fully SSR.
export function HomeStack() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>{stack.eyebrow}</Eyebrow>
        <h2
          id="stack-title"
          className="mt-5 font-display text-3xl text-paper sm:text-4xl"
        >
          {stack.title}
        </h2>

        <dl className="mt-12 flex flex-col">
          {stack.categories.map((row) => (
            <Reveal
              key={row.category}
              className="grid gap-3 border-t border-line py-6 sm:grid-cols-[200px_1fr] sm:gap-8"
            >
              <dt className="pt-1 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
                {row.category}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {row.items.map((item) => (
                  <span
                    key={item}
                    className="border border-line px-2.5 py-1 text-sm text-paper/85"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
