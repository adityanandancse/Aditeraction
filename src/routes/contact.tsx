import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { buildEnquiryMailto } from "~/lib/contact";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";
import { FaqList } from "~/components/shared/FaqList";

// Mirrors ui/Button's primary variant (Vermilion bg, Ink text); a plain <a> is
// used because the href is a mailto, not a router path.
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-vermilion bg-vermilion text-ink hover:bg-[#e8442a]";

// Whitelist query params against site.ts; ignore anything else. Typed as string[]
// so .includes() accepts an arbitrary string.
const PLAN_IDS: string[] = site.plans.map((p) => p.id);
const SERVICE_SLUGS: string[] = site.services.map((s) => s.slug);

// Contact FAQ subset — pulled from the global FAQs by question (single source).
const CONTACT_FAQ_QS = [
  "How do I get started?",
  "How do payments work?",
  "What currencies and payment methods do you accept?",
  "Do you work with international clients across time zones?",
] as const;
const contactFaqs = CONTACT_FAQ_QS.map((q) => site.faqs.find((f) => f.q === q)).filter(
  (f): f is (typeof site.faqs)[number] => Boolean(f),
);

const { process } = site.home;

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { plan?: string; service?: string } => ({
    plan: typeof search.plan === "string" && PLAN_IDS.includes(search.plan) ? search.plan : undefined,
    service:
      typeof search.service === "string" && SERVICE_SLUGS.includes(search.service)
        ? search.service
        : undefined,
  }),
  head: () =>
    seo({
      title: "Contact Aditeraction — Start Your Project",
      description:
        "Email us to start your project. We reply within 24 hours on working days. A founder-led design and engineering studio working with clients worldwide.",
      path: "/contact", // canonical ignores query params
    }),
  component: Contact,
});

function Contact() {
  const { plan, service } = Route.useSearch();
  const planName = site.plans.find((p) => p.id === plan)?.name;
  const serviceTitle = site.services.find((s) => s.slug === service)?.title;
  const mailto = buildEnquiryMailto({ plan, service });
  const enquiringAbout = [planName, serviceTitle].filter(Boolean).join(" · ");

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the plain address is still visible */
    }
  };

  return (
    <>
      <section aria-labelledby="contact-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
        <Eyebrow className="mt-8">{site.contact.eyebrow}</Eyebrow>
        <h1 id="contact-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
          Start a project
        </h1>
        <p className="mt-6 max-w-2xl text-graphite">
          Tell us what you&apos;re building. We reply within 24 hours on working days.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* Email-first actions */}
          <div>
            {enquiringAbout && (
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">
                Enquiring about: <span className="text-paper">{enquiringAbout}</span>
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <a href={mailto} className={primaryBtn}>
                Email us
              </a>
              {/* JS-only enhancement: hidden without JS (the address below is the
                  no-JS path). `.js` is added to <html> before paint. */}
              <button
                type="button"
                onClick={copy}
                className="hidden items-center gap-2 rounded-none border border-line-strong px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:border-paper focus-visible:outline-2 focus-visible:outline-vermilion [.js_&]:inline-flex"
              >
                Copy email
              </button>
              <span aria-live="polite" className="font-mono text-xs uppercase tracking-[0.12em] text-vermilion">
                {copied ? "Copied" : ""}
              </span>
            </div>

            <p className="mt-6 text-sm text-graphite">
              Or email us directly at{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="text-paper underline decoration-vermilion decoration-2 underline-offset-4 transition-colors hover:text-vermilion"
              >
                {site.contact.email}
              </a>
              .
            </p>
          </div>

          {/* Aside: how it works + terms */}
          <Reveal as="aside" className="border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">How it works</h2>
            <ol className="mt-4 flex flex-col gap-3">
              {process.steps.map((step) => (
                <li key={step.index} className="text-sm leading-relaxed text-paper/85">
                  <span className="font-mono text-vermilion">{step.title}</span> — {step.body}
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-line pt-6 text-sm text-graphite">
              Payment is 60% upfront and 40% at launch.
            </p>
            <p className="mt-2 text-sm text-graphite">
              Working worldwide — calls in your time zone.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Questions */}
      <section aria-labelledby="contact-faq-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Eyebrow>FAQ</Eyebrow>
          <h2 id="contact-faq-title" className="mt-5 font-display text-3xl text-paper sm:text-4xl">
            Questions
          </h2>
          <FaqList items={contactFaqs} idPrefix="contact-faq" />
        </div>
      </section>
    </>
  );
}
