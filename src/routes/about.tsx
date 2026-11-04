import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";

// Values from brand context. No reference to any previous company of the founder.
const values = [
  ["Own the whole outcome", "We're accountable for the launch, not just the deliverable."],
  ["Craft you can feel", "Every pixel, line of code and frame is intentional. No templates."],
  ["Design and code are one discipline", "We design what we can build and build what we design."],
  ["Say it straight", "Honest timelines, honest pricing, the hard thing said early."],
  ["Show, don't claim", "Credibility comes from shipped work, never borrowed stats."],
];

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Aditeraction — a founder-led studio",
      description:
        "Design and engineering under one roof, led by founder Aditya. We own the outcome, not just the deliverable. India and worldwide.",
      path: "/about",
    }),
  component: About,
});

function About() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />
      <Eyebrow className="mt-8">About</Eyebrow>
      <h1 className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
        A founder-led design &amp; engineering studio.
      </h1>
      <p className="mt-6 max-w-2xl text-graphite">
        Aditeraction exists to help founders anywhere launch brands, sites and apps that look as good as
        their idea — by putting design and engineering under one roof and owning the journey from first
        sketch to live product. You work directly with the founder, {site.founder}, not an account manager.
      </p>

      <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
        {values.map(([title, body]) => (
          <div key={title} className="bg-fog p-6">
            <h2 className="font-display text-lg text-paper">{title}</h2>
            <p className="mt-2 text-sm text-graphite">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
