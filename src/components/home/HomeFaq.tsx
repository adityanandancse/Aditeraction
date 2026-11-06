import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { FaqList } from "~/components/shared/FaqList";

// Home FAQ (Phase 6a) — all global FAQs, rendered just before the contact CTA.
// Ink surface; native <details> list (SSR content, zero JS). Copy lives in
// site.faqs; only the eyebrow and H2 are headings.
export function HomeFaq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>FAQ</Eyebrow>
        <h2 id="faq-title" className="mt-5 font-display text-3xl text-paper sm:text-4xl">
          Questions, answered.
        </h2>
        <FaqList items={site.faqs} idPrefix="faq" />
      </div>
    </section>
  );
}
