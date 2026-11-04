import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { ButtonLink } from "~/components/ui/Button";
import { Reveal } from "~/components/motion/Reveal";
import { site } from "~/lib/site";

// No case-study data yet — none is invented (hard rule). The hub ships with an
// honest empty state; real case studies become spokes as projects land.
const caseStudies: { slug: string; title: string }[] = [];

export const Route = createFileRoute("/work/")({
  head: () =>
    seo({
      title: "Selected work & case studies",
      description:
        "Shipped brands, sites and apps — the proof of craft. See how founders went from idea to launched. Case studies in preparation.",
      path: "/work",
    }),
  component: WorkHub,
});

function WorkHub() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Work" }]} />
      <Eyebrow className="mt-8">Selected work</Eyebrow>
      <h1 className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">The work is the pitch.</h1>
      <p className="mt-6 max-w-2xl text-graphite">
        Shipped brands, sites and apps — the proof of craft. We show, we don&apos;t claim: case studies
        are in preparation and will land here with real results, not borrowed stats.
      </p>

      {caseStudies.length === 0 ? (
        <Reveal as="div" className="mt-12 border border-line bg-fog p-8">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">
            Case studies in preparation
          </p>
          <p className="mt-3 max-w-xl text-paper/85">
            Want to be one of the first? Tell us what you&apos;re launching.
          </p>
          <div className="mt-6">
            <ButtonLink to={site.cta.to} variant="primary">
              {site.cta.label}
            </ButtonLink>
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}
