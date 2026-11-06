import type { Faq } from "~/lib/site";

// Slugified id anchor per question (e.g. #faq-how-much-does-a-project-cost).
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Native <details>/<summary> FAQ list — zero JS, so every answer ships in the SSR
// HTML (crawlable and answer-engine-friendly even while collapsed). The question
// carries heading semantics (role="heading" aria-level={3}); a Vermilion +/−
// indicator toggles purely on the CSS `open` state (no script, no height
// animation → no layout shift, reduced-motion safe). Visible focus comes from the
// global :focus-visible outline on the summary.
export function FaqList({
  items,
  idPrefix = "faq",
}: {
  items: readonly Faq[];
  idPrefix?: string;
}) {
  return (
    <div className="mt-10 border-y border-line">
      {items.map((item) => (
        <details
          key={item.q}
          id={`${idPrefix}-${slugify(item.q)}`}
          className="group border-b border-line last:border-b-0"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <span role="heading" aria-level={3} className="font-display text-lg text-paper">
              {item.q}
            </span>
            <span aria-hidden className="shrink-0 font-mono text-xl leading-none text-vermilion">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">&minus;</span>
            </span>
          </summary>
          <p className="max-w-2xl pb-5 text-sm leading-relaxed text-graphite">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
