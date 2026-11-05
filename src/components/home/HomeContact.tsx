import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";
import { ButtonLink } from "~/components/ui/Button";

const { contact, cta } = site;

// Contact CTA (Phase 4b, section 7). The H2 is the tagline "Idea to launched."
// (its full stop is Vermilion, per brand) — kept on its own line, never beside
// the descriptor. Primary button → /contact; the email is the secondary
// mailto. Ink surface, fully SSR.
export function HomeContact() {
  return (
    <section
      id="contact-cta"
      aria-labelledby="contact-cta-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Reveal className="max-w-2xl">
          <Eyebrow>{contact.eyebrow}</Eyebrow>
          <h2
            id="contact-cta-title"
            className="mt-5 font-display text-4xl text-paper sm:text-5xl"
          >
            {contact.title.replace(/\.$/, "")}
            <span className="text-vermilion">.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-graphite">
            {contact.body}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <ButtonLink to={cta.to} variant="primary">
              {cta.label}
            </ButtonLink>
            <a
              href={`mailto:${contact.email}`}
              className="font-mono text-sm text-paper/80 underline decoration-line-strong underline-offset-4 transition-colors hover:text-vermilion hover:decoration-vermilion"
            >
              {contact.email}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
