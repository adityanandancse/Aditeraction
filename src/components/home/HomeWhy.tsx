import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";

const { why } = site.home;

// Why Aditeraction (Phase 4c, section B). A numbered list (01–05) of reasons,
// each an H3 + one line. Ink surface, grid 1 / 2 / 3 columns, fully SSR.
export function HomeWhy() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>{why.eyebrow}</Eyebrow>
        <h2
          id="why-title"
          className="mt-5 font-display text-3xl text-paper sm:text-4xl"
        >
          {why.title}
        </h2>

        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {why.points.map((point, i) => (
            <Reveal as="li" key={point.title} className="list-none">
              <span className="font-mono text-sm text-graphite">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl text-paper">{point.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{point.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
