import { Link } from "@tanstack/react-router";
import { site } from "~/lib/site";
import { LogoHorizontal } from "./Logo";

const colTitle = "font-mono text-[11px] uppercase tracking-[0.14em] text-graphite";
const colLink = "text-sm text-paper/80 transition-colors hover:text-vermilion";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" aria-label="Aditeraction, home" className="inline-flex h-5">
              <LogoHorizontal className="h-5" />
            </Link>
            {/* Tagline and descriptor NEVER on the same visual line. */}
            <p className="mt-5 font-display text-lg tracking-[-0.03em] text-paper">
              Idea to launched<span className="text-vermilion">.</span>
            </p>
            <p className="mt-1 text-sm text-graphite">{site.descriptor}</p>
          </div>

          {/* Services column */}
          <div>
            <p className={colTitle}>Services</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {site.services.map((s) => (
                <li key={s.slug}>
                  <Link to="/services/$slug" params={{ slug: s.slug }} className={colLink}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio column */}
          <div>
            <p className={colTitle}>Studio</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {site.footer.studio.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={colLink}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect column — email is real; social renders nothing until site.social has entries */}
          <div>
            <p className={colTitle}>Connect</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a href={`mailto:${site.email}`} className={colLink}>
                  {site.email}
                </a>
              </li>
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className={colLink} rel="me noopener" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column — placeholders (pages not in Phase 1 scope; no broken links) */}
          <div>
            <p className={colTitle}>Legal</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {site.footer.legal.map((label) => (
                <li key={label} className="text-sm text-graphite/60">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-graphite sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {site.name}. Founder-led, {site.founder}.
          </span>
          <span>India &amp; worldwide</span>
        </div>
      </div>
    </footer>
  );
}
