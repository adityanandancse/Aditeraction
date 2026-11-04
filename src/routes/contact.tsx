import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { BracketLink } from "~/components/ui/BracketLink";
import { Reveal } from "~/components/motion/Reveal";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "Start a project",
      description:
        "Tell us what you're launching. Founder-led replies, honest timelines and pricing. Serving founders across India and worldwide.",
      path: "/contact",
    }),
  component: Contact,
});

function Contact() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
      <Eyebrow className="mt-8">Start a project</Eyebrow>
      <h1 className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">Tell us what you&apos;re launching.</h1>
      <p className="mt-6 max-w-2xl text-graphite">
        Brand, site, app, marketing or video — or all of it, under one roof. You&apos;ll hear back from the
        founder, with honest timelines and pricing. We work across Indian and international time zones.
      </p>

      <div className="mt-10">
        <a
          href={`mailto:${site.email}`}
          className="font-display text-2xl text-paper underline decoration-vermilion decoration-2 underline-offset-8 hover:text-vermilion sm:text-4xl"
        >
          {site.email}
        </a>
      </div>

      <Reveal as="div" className="mt-14 border-t border-line pt-8">
        <Eyebrow>Explore</Eyebrow>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
          <BracketLink to="/services">Services</BracketLink>
          <BracketLink to="/work">Work</BracketLink>
          <BracketLink to="/about">About</BracketLink>
        </div>
      </Reveal>
    </section>
  );
}
