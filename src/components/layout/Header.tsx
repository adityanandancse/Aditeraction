import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "~/lib/site";
import { LogoHorizontal } from "./Logo";
import { ButtonLink } from "../ui/Button";

const navLink =
  "font-mono text-xs uppercase tracking-[0.12em] text-paper/80 transition-colors hover:text-paper";

export function Header() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Escape closes menus; outside-click closes the services dropdown.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Solid near-opaque Ink instead of bg + backdrop-blur: a blurred backdrop
  // re-samples and repaints the WebGL hero on every scroll frame. Brand-safe
  // (Ink at 92%).
  return (
    <header
      className="sticky top-0 z-50 border-b border-line"
      style={{ backgroundColor: "rgb(11 11 13 / 0.92)" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" aria-label="Aditeraction, home" className="h-5">
          <LogoHorizontal className="h-5" />
        </Link>

        {/* Desktop nav — all links present in SSR HTML */}
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <ul className="flex items-center gap-7">
            {/* Services dropdown */}
            <li
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                ref={triggerRef}
                type="button"
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                aria-controls="services-menu"
                onClick={() => setServicesOpen((v) => !v)}
                className={`${navLink} flex items-center gap-1.5`}
              >
                Services
                <span aria-hidden className="text-vermilion">
                  {servicesOpen ? "–" : "+"}
                </span>
              </button>
              {/* Rendered in the DOM always (SSR-crawlable); visually toggled */}
              <ul
                id="services-menu"
                className={`absolute left-0 top-full min-w-64 border border-line bg-fog p-2 ${
                  servicesOpen ? "block" : "hidden"
                }`}
              >
                {site.services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      onClick={() => setServicesOpen(false)}
                      className="block px-3 py-2 text-sm text-paper/85 transition-colors hover:bg-ink hover:text-vermilion"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {site.nav
              .filter((n) => n.to !== "/services")
              .map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={navLink}>
                    {n.label}
                  </Link>
                </li>
              ))}
          </ul>

          <ButtonLink to={site.cta.to} variant="primary">
            {site.cta.label}
          </ButtonLink>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="font-mono text-xs uppercase tracking-[0.12em] text-paper md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Primary mobile"
          className="border-t border-line bg-ink px-6 py-6 md:hidden"
        >
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">Services</p>
          <ul className="mb-5 flex flex-col gap-2">
            {site.services.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  onClick={() => setMobileOpen(false)}
                  className="text-paper/85 hover:text-vermilion"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-3 border-t border-line pt-5">
            {site.nav
              .filter((n) => n.to !== "/services")
              .map((n) => (
                <li key={n.to}>
                  <Link to={n.to} onClick={() => setMobileOpen(false)} className={navLink}>
                    {n.label}
                  </Link>
                </li>
              ))}
          </ul>
          <div className="mt-6">
            <ButtonLink to={site.cta.to} variant="primary" className="w-full">
              {site.cta.label}
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
