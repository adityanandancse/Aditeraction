// Single source of truth for Aditeraction site content and structure.
// Nav + footer mirror .agents/seo/01-site-architecture.md. Services match the
// 6 locked slugs. No invented URLs, handles, stats or client facts anywhere.

export interface ServiceDef {
  slug: string;
  name: string; // nav / card label
  short: string; // one-line card description
  seoTitle: string; // <title> — pattern from 02-seo-plan.md
  seoDescription: string; // meta description — from 02-seo-plan.md
  intro: string; // real on-page paragraph (no lorem ipsum)
}

// Static routes used in nav/footer (keeps TanStack's typed `to` happy).
export type AppPath = "/" | "/services" | "/work" | "/about" | "/contact";

export interface NavItem {
  label: string;
  to: AppPath;
}

export const site = {
  name: "Aditeraction",
  url: "https://aditeraction.com",
  tagline: "Idea to launched.", // never on the same visual line as the descriptor
  descriptor: "Brand, site, app. One roof.",
  founder: "Aditya",
  email: "info@aditeraction.com",
  // Core message (real copy from brand context) — used on Home.
  coreMessage:
    "Aditeraction is a founder-led design-and-engineering studio. The same team designs your brand and writes the production code that ships it — so nothing is lost between a nice mockup and a live product. For founders in India and worldwide.",

  // The 6 locked service lines (slugs from 01-site-architecture.md).
  services: [
    {
      slug: "web-and-brand",
      name: "Web + Brand",
      short: "Custom-coded websites and brand identity from one team.",
      seoTitle: "Web design & branding studio — Aditeraction",
      seoDescription:
        "Custom-coded websites and brand identity from one team — no handoff, no templates. Idea to launched for founders, India and worldwide.",
      intro:
        "Your brand and your website, designed and built by one team. We draw the identity and write the production code, so what you approve in design is what ships — no handoff, no templates, no drift between mockup and live site.",
    },
    {
      slug: "product-app-engineering",
      name: "Product & App Engineering",
      short: "Custom web and app engineering, MVP to launch.",
      seoTitle: "Product & app engineering studio — Aditeraction",
      seoDescription:
        "Custom web and app engineering (React, SSR) for founders — MVP to launch. Design and code under one roof. India and worldwide.",
      intro:
        "Custom web and app engineering, from first MVP to launched product. We design what we can build and build what we design, so the product you ship feels as considered as the pitch — fast, custom-coded, and ready for real users.",
    },
    {
      slug: "fashion-d2c",
      name: "Fashion & D2C",
      short: "Branding and custom storefronts for fashion and D2C.",
      seoTitle: "Fashion & D2C brand and website studio — Aditeraction",
      seoDescription:
        "Branding, packaging and custom Shopify/web for fashion and D2C founders. One team, idea to launched. India and worldwide.",
      intro:
        "Branding, packaging and custom storefronts for fashion and D2C founders. One team takes the label from identity to a storefront that sells — considered, fast and built to look as premium as the product inside.",
    },
    {
      slug: "branding-packaging",
      name: "Branding & Packaging",
      short: "Logos, brand identity and packaging with intent.",
      seoTitle: "Branding & packaging design studio — Aditeraction",
      seoDescription:
        "Logos, brand identity and packaging that look as good as your idea. Founder-led, premium craft, accessible pricing. India and worldwide.",
      intro:
        "Logos, brand identity and packaging that look as good as your idea. Every mark, colour and surface is intentional — a system you can build on, not a template that shows. Premium craft at a lean studio's pace.",
    },
    {
      slug: "digital-marketing",
      name: "Digital Marketing",
      short: "SEO, social and ads by the team that built your site.",
      seoTitle: "Digital marketing for founders — Aditeraction",
      seoDescription:
        "SEO, social and ads run by the team that built your brand and site. Honest, measurable, founder-led. India and worldwide.",
      intro:
        "SEO, social and ads run by the same team that built your brand and site. Because we own the whole picture, the marketing matches the product — honest, measurable, and pointed at the outcome rather than vanity numbers.",
    },
    {
      slug: "video",
      name: "Video",
      short: "Launch, brand and product video, in-house.",
      seoTitle: "Brand & product video studio — Aditeraction",
      seoDescription:
        "Launch, brand and product video from the studio that ships your site and brand. One team, one timeline. India and worldwide.",
      intro:
        "Launch films, brand video and product motion from the studio that already ships your site and brand. One team and one timeline, so the film speaks the same language as everything else you put in front of customers.",
    },
  ] satisfies ServiceDef[],

  // Primary navigation (header) — per 01-site-architecture.md §4.
  nav: [
    { label: "Services", to: "/services" },
    { label: "Work", to: "/work" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ] satisfies NavItem[],

  cta: { label: "Start a project", to: "/contact" },

  // Footer — per 01-site-architecture.md §5. Four columns + brand block.
  footer: {
    studio: [
      { label: "Work", to: "/work" },
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ] satisfies NavItem[],
    // Legal pages are flagged in 01 §8 — not part of the Phase 1 route scope,
    // so rendered as non-linked placeholders (no broken internal links).
    legal: ["Privacy", "Terms"],
  },

  // Social profiles — NEVER invent URLs or handles. Renders nothing until real
  // entries are added here. [PLACEHOLDER: add { label, href } once confirmed]
  social: [] as { label: string; href: string }[],
} as const;

export type Site = typeof site;

export function getService(slug: string): ServiceDef | undefined {
  return site.services.find((s) => s.slug === slug);
}
