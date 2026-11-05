import { Link } from "@tanstack/react-router";
import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";

const { servicesSection } = site.home;

// Services (Phase 4b, section 4). Richer than the old "What we do" grid: each
// card carries its mono index, title, summary, who it's for and the full
// deliverables list, linking to its service page. Data is the shared top-level
// `services` array. Ink surface; grid is 1 / 2 / 3 columns. Fully SSR.
export function HomeServices() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>{servicesSection.eyebrow}</Eyebrow>
        <h2
          id="services-title"
          className="mt-5 max-w-2xl font-display text-3xl text-paper sm:text-4xl"
        >
          {servicesSection.title}
        </h2>

        <ol className="mt-12 grid list-none gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {site.services.map((service, i) => (
            <Reveal as="li" key={service.slug}>
              <Link
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="group flex h-full flex-col bg-ink p-8 transition-colors hover:bg-fog focus-visible:bg-fog"
              >
                <span className="font-mono text-sm text-graphite">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-xl text-paper">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{service.summary}</p>
                <p className="mt-2 text-sm leading-relaxed text-graphite/80">{service.forWho}</p>

                <ul className="mt-6 flex flex-1 flex-col gap-1.5 border-t border-line pt-6">
                  {service.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-sm text-paper/80"
                    >
                      <span aria-hidden className="mt-2 size-1 shrink-0 bg-line-strong" />
                      {d}
                    </li>
                  ))}
                </ul>

                <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors group-hover:text-vermilion">
                  View service
                  <span aria-hidden>&rarr;</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
