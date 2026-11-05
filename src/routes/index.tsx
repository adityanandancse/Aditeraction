import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Panel } from "~/components/ui/Panel";
import { Reveal } from "~/components/motion/Reveal";
import { Landing } from "~/components/landing/Landing";
import { IntroLoader } from "~/components/landing/IntroLoader";

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
      {/* Home-only intro overlay (shown once per session, never no-JS/reduced). */}
      <IntroLoader />

      {/* Scroll-story hero: static SSR fallback + decorative particle canvas.
          The H1 "Idea to launched." is the LCP — never the canvas. */}
      <Landing />

      {/* Services overview — links to every spoke (hub-and-spoke, 01 §7).
          Below the fold (starts ~2800px down) → skip rendering until near view. */}
      <section className="adx-cv-section mx-auto max-w-6xl px-6 py-16">
        <Eyebrow>What we do</Eyebrow>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.services.map((s) => (
            <Reveal key={s.slug} className="h-full">
              <Link to="/services/$slug" params={{ slug: s.slug }} className="block h-full">
                <Panel className="h-full">
                  <h2 className="font-display text-lg text-paper">{s.name}</h2>
                  <p className="mt-2 text-sm text-graphite">{s.short}</p>
                </Panel>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
