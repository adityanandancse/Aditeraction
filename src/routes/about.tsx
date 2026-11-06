import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { BracketLink } from "~/components/ui/BracketLink";
import { Reveal } from "~/components/motion/Reveal";
import { AnswerBlock } from "~/components/shared/AnswerBlock";
import { HomeWhy } from "~/components/home/HomeWhy";
import { HomeReach } from "~/components/home/HomeReach";
import { HomeContact } from "~/components/home/HomeContact";

const { founder, howWeWork } = site;
// Meta description (≤155), sourced from the founder facts.
const aboutDescription =
  "Aditeraction is a founder-led design and engineering studio in Noida, India. Brand, website and app for founders across India and worldwide.";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Aditeraction — Founder-led Studio, Noida, India",
      description: aboutDescription,
      path: "/about",
    }),
  component: About,
});

function About() {
  return (
    <>
      <section aria-labelledby="about-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />
        <Eyebrow className="mt-8">About</Eyebrow>
        <h1 id="about-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
          About Aditeraction
        </h1>
        <AnswerBlock item={site.answers.whatWeDo} className="mt-8" />
      </section>

      {/* Founder */}
      <section aria-labelledby="founder-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="founder-title" className="font-display text-2xl text-paper sm:text-3xl">
            Founder
          </h2>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
            {founder.role}
          </p>
          <p className="mt-2 font-display text-3xl text-paper">{founder.name}</p>
          <p className="mt-6 max-w-2xl leading-relaxed text-graphite">{founder.bio}</p>
          <ul className="mt-8 flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.12em] text-paper/80">
            <li>{founder.education}</li>
            <li>Building for the web since {founder.since}</li>
            <li>{founder.location}</li>
          </ul>
        </div>
      </section>

      {/* How we work — single-source from site.howWeWork (all from facts) */}
      <section aria-labelledby="howwework-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="howwework-title" className="font-display text-2xl text-paper sm:text-3xl">
            How we work
          </h2>
          <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {howWeWork.map((item) => (
              <Reveal key={item.label} className="bg-ink p-8">
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-vermilion">
                  {item.label}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-graphite">{item.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Reused home sections — unique heading ids (#why, #reach) on this page */}
      <HomeWhy />
      <HomeReach />

      {/* Industries + routes into services */}
      <section aria-labelledby="industries-title" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="industries-title" className="font-display text-2xl text-paper sm:text-3xl">
            Who we work with
          </h2>
          <p className="mt-6 max-w-2xl text-graphite">
            Delivered for fashion, textiles, D2C, restaurants and real estate.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <BracketLink to="/services">Services</BracketLink>
            <Link
              to="/services"
              hash="plans"
              className="font-mono text-xs uppercase tracking-[0.1em] text-graphite transition-colors hover:text-vermilion"
            >
              Plans
            </Link>
          </div>
        </div>
      </section>

      <HomeContact />
    </>
  );
}
