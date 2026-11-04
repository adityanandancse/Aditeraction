import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Panel } from "~/components/ui/Panel";
import { ButtonLink } from "~/components/ui/Button";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Aditeraction — Design & engineering studio for founders",
      description:
        "A founder-led studio that takes you from idea to launched brand, site and app. Design and code under one roof — India and worldwide. Start a project.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero — WebGL particle animation (Phase 2) lazy-loads over a static
          fallback. All copy here is real SSR text. Tagline (H1) and descriptor
          sit on separate visual lines. */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <Eyebrow>Design &amp; engineering studio</Eyebrow>
        <h1 className="mt-6 text-5xl leading-[0.98] text-paper sm:text-7xl">
          Idea to launched<span className="text-vermilion">.</span>
        </h1>
        <p className="mt-6 font-display text-xl text-paper/90 sm:text-2xl">{site.descriptor}</p>
        <p className="mt-6 max-w-2xl text-graphite">{site.coreMessage}</p>
        <div className="mt-9 flex flex-wrap gap-4">
          <ButtonLink to={site.cta.to} variant="primary">
            {site.cta.label}
          </ButtonLink>
          <ButtonLink to="/work" variant="secondary">
            See the work
          </ButtonLink>
        </div>
      </section>

      {/* Services overview — links to every spoke (hub-and-spoke, 01 §7) */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Eyebrow>What we do</Eyebrow>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}
