import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site, getPublishedWork } from "~/lib/site";
import { workHubGraph } from "~/lib/schema";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";
import { HomeContact } from "~/components/home/HomeContact";

// Industries + regions, derived from site data so the copy stays single-source.
const ind = site.industries.map((x) => (x === "D2C" ? x : x.toLowerCase()));
const industriesText = `${ind.slice(0, -1).join(", ")} and ${ind[ind.length - 1]}`;
const regionsText = `${site.home.reach.regions
  .filter((r) => !("local" in r && r.local))
  .map((r) => r.label)
  .join(", ")} and across India`;

export const Route = createFileRoute("/work/")({
  head: () => {
    const base = seo({
      title: "Work — Brand, Web & App Projects | Aditeraction",
      description: `Brand, website and app projects for founders across ${industriesText}. India, UK, USA, UAE and worldwide.`,
      path: "/work",
      image: "/og/work.png",
      imageAlt: "Work",
      graph: workHubGraph(),
    });
    // Thin page while no case studies are published: keep it out of the index but
    // let crawlers follow links. This branch disappears once one item is published.
    return getPublishedWork().length === 0
      ? { ...base, meta: [...base.meta, { name: "robots", content: "noindex, follow" }] }
      : base;
  },
  component: WorkHub,
});

function WorkHub() {
  const work = getPublishedWork();

  return (
    <>
      <section aria-labelledby="work-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Work" }]} />
        <Eyebrow className="mt-8">Selected work</Eyebrow>
        <h1 id="work-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
          Work
        </h1>
        <p className="mt-6 max-w-2xl text-graphite">
          Brand, site and app projects delivered for {industriesText} — for founders in {regionsText}.
        </p>

        {work.length > 0 ? (
          <ol className="mt-12 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {work.map((item) => (
              <Reveal as="li" key={item.slug} className="h-full">
                <Link
                  to="/work/$slug"
                  params={{ slug: item.slug }}
                  className="group flex h-full flex-col border border-line p-6 transition-colors hover:border-line-strong focus-visible:border-line-strong"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                    {item.industry} · {item.region}
                  </span>
                  <span className="mt-3 font-display text-lg text-paper">{item.title}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-graphite">
                    {item.summary}
                  </span>
                  <span className="mt-6 flex flex-wrap gap-1.5">
                    {item.services.map((slug) => (
                      <span
                        key={slug}
                        className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/80"
                      >
                        {slug}
                      </span>
                    ))}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        ) : (
          // Honest empty state — NO fake cards. Real case studies land here as
          // projects ship.
          <Reveal as="div" className="mt-12 border border-line bg-fog p-8">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">
              In preparation
            </p>
            <p className="mt-3 max-w-xl text-paper/85">
              Case studies are being prepared. Ask us for examples relevant to your industry.
            </p>
            <div className="mt-6">
              <a
                href={`mailto:${site.email}`}
                className="font-mono text-sm text-paper underline decoration-vermilion decoration-2 underline-offset-4 transition-colors hover:text-vermilion"
              >
                {site.email}
              </a>
            </div>
          </Reveal>
        )}
      </section>

      <HomeContact />
    </>
  );
}
