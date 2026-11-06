import { site } from "~/lib/site";
import { Reveal } from "~/components/motion/Reveal";

const { plans, plansAddon, plansNote, plansRevisions } = site;

// Primary button styling mirrors ui/Button's BASE + primary variant exactly
// (Vermilion background, Ink text). A plain <a> is used because the CTA carries
// a ?plan= query string, which the typed <Link to> API does not model here.
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-vermilion bg-vermilion text-ink hover:bg-[#e8442a]";

// The three plan cards + the add-on / pricing-note row, extracted from HomePlans
// so the home page and /services#plans render the identical grid. No section
// wrapper or heading here — the caller supplies those. Middle card (Grow) gets a
// single Vermilion top border as its only emphasis. Pricing is never a number.
export function PlansGrid() {
  return (
    <>
      <ol className="mt-12 grid list-none gap-4 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const previous = i > 0 ? (plans[i - 1]?.name ?? null) : null;
          const emphasis = plan.includesPrevious && i === 1; // middle card only
          return (
            <Reveal as="li" key={plan.id} className="h-full">
              <div
                className={`flex h-full flex-col border border-line bg-ink p-8 ${
                  emphasis ? "border-t-2 border-t-vermilion" : ""
                }`}
              >
                <span className="font-mono text-sm text-graphite">{plan.label}</span>
                <h3 className="mt-6 font-display text-2xl text-paper">{plan.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{plan.forWho}</p>

                <div className="mt-6 flex flex-1 flex-col border-t border-line pt-6">
                  {plan.includesPrevious && previous && (
                    <p className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-paper/80">
                      Everything in {previous}, plus:
                    </p>
                  )}
                  <ul className="flex flex-col gap-1.5">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-paper/80">
                        <span aria-hidden className="mt-2 size-1 shrink-0 bg-line-strong" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
                  {plan.timeline}
                </p>
                <a href={plan.ctaHref} className={`${primaryBtn} mt-6 w-full`}>
                  {plan.ctaLabel}
                </a>
              </div>
            </Reveal>
          );
        })}
      </ol>

      {/* Add-on + pricing note below the grid. */}
      <Reveal className="mt-8 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-graphite">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-paper">
            {plansAddon.name}
          </span>
          <span className="mt-1 block">{plansAddon.body}</span>
        </p>
        <p className="text-sm text-graphite">
          {plansNote} {plansRevisions}
        </p>
      </Reveal>
    </>
  );
}
