import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";

const { process } = site.home;

// How it works: Call / Build / Launch. Ink surface, numbered steps. The mono
// index is the one accent touch in this view (vermilion numerals). Fully SSR,
// real height from first paint — no reserved space, no layout shift.
export function HomeProcess() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>{process.eyebrow}</Eyebrow>
        <h2
          id="how-it-works-title"
          className="mt-5 font-display text-3xl text-paper sm:text-4xl"
        >
          {process.title}
        </h2>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {process.steps.map((step) => (
            <Reveal as="li" key={step.index} className="list-none">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-vermilion">{step.index}</span>
                <span aria-hidden className="h-px flex-1 bg-line-strong" />
              </div>
              <h3 className="mt-5 font-display text-xl text-paper">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
