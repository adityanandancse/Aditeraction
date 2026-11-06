import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { PlansGrid } from "~/components/shared/PlansGrid";

const { plansSection } = site.home;

// Plans (Phase 4c, section A). Section wrapper + heading; the cards and add-on/
// pricing note are the shared PlansGrid (also used by /services#plans). Ink
// surface, fully SSR. Renders identically to the pre-extraction markup.
export function HomePlans() {
  return (
    <section
      id="plans"
      aria-labelledby="plans-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>{plansSection.eyebrow}</Eyebrow>
        <h2
          id="plans-title"
          className="mt-5 font-display text-3xl text-paper sm:text-4xl"
        >
          {plansSection.title}
        </h2>

        <PlansGrid />
      </div>
    </section>
  );
}
