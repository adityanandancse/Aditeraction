import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";
import { ServiceCard } from "~/components/shared/ServiceCard";

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
              <ServiceCard service={service} index={i} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
