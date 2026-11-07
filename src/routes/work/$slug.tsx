import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { getCaseStudy, getPublishedWork, getService, type CaseStudy } from "~/lib/site";
import { caseStudyGraph } from "~/lib/schema";
import { Breadcrumbs, type Crumb } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { BracketLink } from "~/components/ui/BracketLink";
import { Reveal } from "~/components/motion/Reveal";
import { HomeContact } from "~/components/home/HomeContact";

// Exported for Phase 7 (BreadcrumbList + CreativeWork JSON-LD can reuse these).
export function getCaseStudyCrumbs(cs: CaseStudy): Crumb[] {
  return [
    { label: "Home", to: "/" },
    { label: "Work", to: "/work" },
    { label: cs.title },
  ];
}

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const cs = getCaseStudy(params.slug); // published only → placeholders 404
    if (!cs) throw notFound();
    return cs;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return seo({ title: "Work", description: "Case study.", path: "/work" });
    const full = `${loaderData.title} — ${loaderData.industry} case study | Aditeraction`;
    const title = full.length <= 60 ? full : `${loaderData.title} — case study | Aditeraction`;
    return seo({
      title,
      description: loaderData.summary,
      path: `/work/${loaderData.slug}`,
      graph: caseStudyGraph(loaderData),
    });
  },
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const cs = Route.useLoaderData();
  const meta = [cs.industry, cs.region, cs.year ? String(cs.year) : null].filter(Boolean);
  const servicesUsed = cs.services
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const all = getPublishedWork();
  const idx = all.findIndex((w) => w.slug === cs.slug);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;

  return (
    <>
      <section aria-labelledby="case-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <Breadcrumbs items={getCaseStudyCrumbs(cs)} />
        <Eyebrow className="mt-8">Case study</Eyebrow>
        <h1 id="case-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
          {cs.title}
        </h1>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
          {meta.join(" · ")}
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/90">{cs.summary}</p>
      </section>

      {cs.challenge && (
        <TextSection id="challenge" title="Challenge" body={cs.challenge} />
      )}
      {cs.approach && <TextSection id="approach" title="Approach" body={cs.approach} />}
      {cs.outcome && <TextSection id="outcome" title="Outcome" body={cs.outcome} />}

      {cs.metrics && cs.metrics.length > 0 && (
        <Band id="metrics" title="Results">
          <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {cs.metrics.map((m) => (
              <div key={m.label} className="bg-ink p-8">
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">
                  {m.label}
                </dt>
                <dd className="mt-3 font-display text-4xl text-paper">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Band>
      )}

      {cs.deliverables && cs.deliverables.length > 0 && (
        <Band id="deliverables" title="Deliverables">
          <ul className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {cs.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 text-paper/85">
                <span aria-hidden className="mt-2.5 size-1 shrink-0 bg-vermilion" />
                {d}
              </li>
            ))}
          </ul>
        </Band>
      )}

      {cs.stack && cs.stack.length > 0 && (
        <Band id="stack" title="Stack">
          <div className="mt-8 flex flex-wrap gap-2">
            {cs.stack.map((t) => (
              <span
                key={t}
                className="border border-line px-2.5 py-1 font-mono text-xs uppercase tracking-[0.1em] text-paper/85"
              >
                {t}
              </span>
            ))}
          </div>
        </Band>
      )}

      {cs.quote && (
        <Band id="quote" title="In their words">
          <figure className="mt-8 border-l-2 border-vermilion pl-6">
            <blockquote className="max-w-2xl font-display text-2xl leading-snug text-paper">
              &ldquo;{cs.quote.text}&rdquo;
            </blockquote>
            <figcaption className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
              {cs.quote.author} · {cs.quote.role}
            </figcaption>
          </figure>
        </Band>
      )}

      {servicesUsed.length > 0 && (
        <Band id="services-used" title="Services used">
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {servicesUsed.map((s) => (
              <BracketLink key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
                {s.title}
              </BracketLink>
            ))}
          </div>
        </Band>
      )}

      {cs.url && (
        <section aria-labelledby="live-title" className="border-t border-line bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 id="live-title" className="font-display text-2xl text-paper sm:text-3xl">
              Live site
            </h2>
            <p className="mt-6">
              <a
                href={cs.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-paper underline decoration-vermilion decoration-2 underline-offset-4 transition-colors hover:text-vermilion"
              >
                {cs.url.replace(/^https?:\/\//, "")}
                <span aria-hidden> ↗</span>
              </a>
            </p>
          </div>
        </section>
      )}

      {(prev || next) && (
        <section aria-labelledby="more-title" className="border-t border-line bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <h2 id="more-title" className="sr-only">
              More case studies
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {prev ? (
                <Link
                  to="/work/$slug"
                  params={{ slug: prev.slug }}
                  className="font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:text-vermilion"
                >
                  <span aria-hidden>← </span>
                  {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to="/work/$slug"
                  params={{ slug: next.slug }}
                  className="font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:text-vermilion"
                >
                  {next.title}
                  <span aria-hidden> →</span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </section>
      )}

      <HomeContact />
    </>
  );
}

// A plain prose section (Challenge / Approach / Outcome).
function TextSection({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <Band id={id} title={title}>
      <p className="mt-6 max-w-2xl leading-relaxed text-graphite">{body}</p>
    </Band>
  );
}

// Shared Ink band with an H2 whose id drives aria-labelledby.
function Band({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 id={`${id}-title`} className="font-display text-2xl text-paper sm:text-3xl">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
