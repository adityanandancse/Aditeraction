import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Panel } from "~/components/ui/Panel";

export const Route = createFileRoute("/services/")({
  head: () =>
    seo({
      title: "Services — branding, web, product & marketing",
      description:
        "Brand, website, app, marketing and video from one studio. Design and engineering under one roof, founder-led. For founders in India and worldwide.",
      path: "/services",
    }),
  component: ServicesHub,
});

function ServicesHub() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Services" }]} />
      <Eyebrow className="mt-8">What we do</Eyebrow>
      <h1 className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
        Design &amp; engineering, under one roof.
      </h1>
      <p className="mt-6 max-w-2xl text-graphite">
        Brand, site, app, marketing and video — one plan, one timeline, one point of contact. The same
        team designs the brand and writes the production code that ships it, so nothing is lost in handoff.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {site.services.map((s) => (
          <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="block">
            <Panel className="h-full">
              <h2 className="font-display text-lg text-paper">{s.name}</h2>
              <p className="mt-2 text-sm text-graphite">{s.short}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </section>
  );
}
