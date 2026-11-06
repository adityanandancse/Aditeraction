import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";
import { ServiceCard } from "~/components/shared/ServiceCard";
import { AnswerBlock } from "~/components/shared/AnswerBlock";
import { PlansGrid } from "~/components/shared/PlansGrid";
import { FaqList } from "~/components/shared/FaqList";
import { HomeContact } from "~/components/home/HomeContact";

const { servicesSection, plansSection } = site.home;

// Lead + meta description both come from answers.whatWeDo (no new copy). The
// meta uses the first sentence (≤155 chars).
const whatWeDo = site.answers.whatWeDo;
const hubDescription = `${whatWeDo.answer.split(". ")[0]}.`;

// Hub FAQ subset (cost, how long, plans, payments, ownership, revisions), pulled
// from the global FAQs by question so there is one source of truth.
const HUB_FAQ_QS = [
  "How much does a project cost?",
  "How long does a project take?",
  "What plans do you offer?",
  "How do payments work?",
  "Who owns the work once it's done?",
  "How many revisions are included?",
] as const;
const hubFaqs = HUB_FAQ_QS.map((q) => site.faqs.find((f) => f.q === q)).filter(
  (f): f is (typeof site.faqs)[number] => Boolean(f),
);

export const Route = createFileRoute("/services/")({
  head: () =>
    seo({
      title: "Services — brand, web, apps, D2C, marketing | Aditeraction",
      description: hubDescription,
      path: "/services",
    }),
  component: ServicesHub,
});

function ServicesHub() {
  return (
    <>
      {/* Intro: H1 + answer-engine lead */}
      <section aria-labelledby="services-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Services" }]} />
        <Eyebrow className="mt-8">{servicesSection.eyebrow}</Eyebrow>
        <h1 id="services-h1" className="mt-5 text-4xl text-paper sm:text-6xl">
          Services
        </h1>
        <AnswerBlock item={whatWeDo} className="mt-8" />
      </section>

      {/* The six service lines */}
      <section
        aria-labelledby="services-grid-title"
        className="border-t border-line bg-ink"
      >
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2
            id="services-grid-title"
            className="font-display text-3xl text-paper sm:text-4xl"
          >
            {servicesSection.title}
          </h2>
          <ol className="mt-10 grid list-none gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {site.services.map((service, i) => (
              <Reveal as="li" key={service.slug}>
                <ServiceCard service={service} index={i} />
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Plans — anchor target for the service pages' "Included in" links */}
      <section id="plans" aria-labelledby="plans-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Eyebrow>{plansSection.eyebrow}</Eyebrow>
          <h2 id="plans-title" className="mt-5 font-display text-3xl text-paper sm:text-4xl">
            {plansSection.title}
          </h2>
          <PlansGrid />
          <p className="mt-10 border-t border-line pt-8 text-sm text-graphite">
            Delivered for fashion, textiles, D2C, restaurants and real estate.
          </p>
        </div>
      </section>

      {/* Questions */}
      <section aria-labelledby="services-faq-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Eyebrow>FAQ</Eyebrow>
          <h2 id="services-faq-title" className="mt-5 font-display text-3xl text-paper sm:text-4xl">
            Questions
          </h2>
          <FaqList items={hubFaqs} idPrefix="services-faq" />
        </div>
      </section>

      <HomeContact />
    </>
  );
}
