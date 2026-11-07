import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { getService, site } from "~/lib/site";
import { serviceGraph } from "~/lib/schema";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { BracketLink } from "~/components/ui/BracketLink";
import { Reveal } from "~/components/motion/Reveal";
import { FaqList } from "~/components/shared/FaqList";
import { HomeContact } from "~/components/home/HomeContact";

// Mirrors ui/Button's primary variant; a plain <a> is used because the CTA
// carries a ?service= query string (not modelled by the typed <Link to> API).
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-vermilion bg-vermilion text-ink hover:bg-[#e8442a]";

const planName = (id: string) => site.plans.find((p) => p.id === id)?.name ?? id;

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound(); // unknown slug → branded 404
    return service;
  },
  head: ({ loaderData }) =>
    seo({
      title: loaderData?.seoTitle ?? "Services",
      description: loaderData?.seoDescription ?? site.coreMessage,
      path: loaderData ? `/services/${loaderData.slug}` : "/services",
      graph: loaderData ? serviceGraph(loaderData) : undefined,
    }),
  component: ServicePage,
});

function ServicePage() {
  const service = Route.useLoaderData();
  const related = site.services.filter((s) => s.slug !== service.slug);

  return (
    <>
      {/* Intro */}
      <section aria-labelledby="service-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Services", to: "/services" },
            { label: service.title },
          ]}
        />
        <Eyebrow className="mt-8">Service</Eyebrow>
        <h1 id="service-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
          {service.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/90">{service.summary}</p>
        <p className="mt-3 max-w-2xl text-graphite">{service.forWho}</p>
      </section>

      {/* What you get */}
      <section aria-labelledby="deliverables-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="deliverables-title" className="font-display text-2xl text-paper sm:text-3xl">
            What you get
          </h2>
          <ul className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 text-paper/85">
                <span aria-hidden className="mt-2.5 size-1 shrink-0 bg-vermilion" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="process-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="process-title" className="font-display text-2xl text-paper sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {service.process.map((step, i) => {
              const [label, ...rest] = step.split(" — ");
              const body = rest.join(" — ");
              return (
                <Reveal as="li" key={label} className="list-none">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm text-vermilion">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-line-strong" />
                  </div>
                  <h3 className="mt-5 font-display text-xl text-paper">{label}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{body}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Timeline & pricing */}
      <section aria-labelledby="timeline-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="timeline-title" className="font-display text-2xl text-paper sm:text-3xl">
            Timeline &amp; pricing
          </h2>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
            Timeline
          </p>
          <p className="mt-2 font-display text-2xl text-paper">{service.timeline}</p>
          <p className="mt-6 max-w-xl text-graphite">
            Pricing on request — every project is quoted to its scope.
          </p>
          <p className="mt-2 max-w-xl text-sm text-graphite">{site.plansRevisions}</p>
          <div className="mt-8">
            <a href={`/contact?service=${service.slug}`} className={primaryBtn}>
              Get a quote
            </a>
          </div>
        </div>
      </section>

      {/* Included in */}
      <section aria-labelledby="included-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="included-title" className="font-display text-2xl text-paper sm:text-3xl">
            Included in
          </h2>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-graphite">
            {service.plans.map((id) => (
              <Link
                key={id}
                to="/services"
                hash="plans"
                className="border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-paper/85 transition-colors hover:border-vermilion hover:text-vermilion"
              >
                {planName(id)}
              </Link>
            ))}
          </p>
        </div>
      </section>

      {/* Questions */}
      <section aria-labelledby="service-faq-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Eyebrow>FAQ</Eyebrow>
          <h2 id="service-faq-title" className="mt-5 font-display text-2xl text-paper sm:text-3xl">
            Questions
          </h2>
          <FaqList items={service.faqs} idPrefix={`faq-${service.slug}`} />
        </div>
      </section>

      {/* Related services */}
      <section aria-labelledby="related-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="related-title" className="font-display text-2xl text-paper sm:text-3xl">
            Related services
          </h2>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {related.map((s) => (
              <BracketLink key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
                {s.title}
              </BracketLink>
            ))}
          </div>
        </div>
      </section>

      <HomeContact />
    </>
  );
}
