import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { getService, site } from "~/lib/site";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { BracketLink } from "~/components/ui/BracketLink";
import { ButtonLink } from "~/components/ui/Button";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound(); // unknown slug → 404
    return service;
  },
  head: ({ loaderData }) =>
    seo({
      title: loaderData?.seoTitle ?? "Services",
      description: loaderData?.seoDescription ?? site.coreMessage,
      path: loaderData ? `/services/${loaderData.slug}` : "/services",
    }),
  component: ServicePage,
});

function ServicePage() {
  const service = Route.useLoaderData();
  const related = site.services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Services", to: "/services" }, { label: service.name }]}
      />
      <Eyebrow className="mt-8">Service</Eyebrow>
      <h1 className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">{service.name}</h1>
      <p className="mt-6 max-w-2xl text-graphite">{service.intro}</p>

      <div className="mt-9">
        <ButtonLink to={site.cta.to} variant="primary">
          {site.cta.label}
        </ButtonLink>
      </div>

      {/* Spoke ↔ spoke links (01 §7.3) + back to hub */}
      <div className="mt-16 border-t border-line pt-8">
        <Eyebrow>Related services</Eyebrow>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
          {related.map((s) => (
            <BracketLink key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
              {s.name}
            </BracketLink>
          ))}
        </div>
        <p className="mt-6">
          <Link to="/services" className="font-mono text-xs uppercase tracking-[0.1em] text-graphite hover:text-vermilion">
            ← All services
          </Link>
        </p>
      </div>
    </section>
  );
}
