// Single source of truth for Aditeraction site content and structure.
// Nav + footer mirror .agents/seo/01-site-architecture.md. Services match the
// 6 locked slugs. No invented URLs, handles, stats or client facts anywhere.

export interface Faq {
  q: string;
  a: string;
}

export interface ServiceDef {
  slug: string;
  name: string; // nav / card label (e.g. "Web + Brand")
  short: string; // one-line nav/footer description
  seoTitle: string; // <title> — pattern from 02-seo-plan.md
  seoDescription: string; // meta description — from 02-seo-plan.md
  intro: string; // real on-page paragraph (no lorem ipsum)
  // Phase 4b additions — the full service data model, reused by Phase 6 pages.
  title: string; // short display title for cards/service page (e.g. "Websites")
  summary: string; // one-line summary
  forWho: string; // one-line "who it's for"
  deliverables: readonly string[];
  process: readonly string[]; // Call / Build / Launch wording for this service
  timeline: string; // TODO(AB) — real timeline once confirmed
  pricing: string; // TODO(AB) — real pricing once confirmed
  faqs: readonly Faq[]; // TODO(AB) — empty until written
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
      title: "Websites",
      summary: "Custom-coded websites, designed and built by one team.",
      forWho: "Founders who need a site that looks premium and loads fast — not a template.",
      deliverables: [
        "Sitemap & content plan",
        "UI design",
        "Responsive build",
        "CMS",
        "SEO/AEO foundations",
        "Analytics",
        "Hosting & domain setup",
      ],
      process: [
        "Call — map the pages, content and goals for the site.",
        "Build — design the UI and write the responsive, custom code.",
        "Launch — go live with the CMS, SEO foundations and analytics in place.",
      ],
      timeline: "TODO(AB)",
      pricing: "TODO(AB)",
      faqs: [],
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
      title: "Web & mobile apps",
      summary: "Custom web and mobile app engineering, from MVP to launch.",
      forWho: "Founders building a product who want design and engineering in one team.",
      deliverables: [
        "Product scoping",
        "UX/UI",
        "Web app",
        "iOS/Android via Capacitor",
        "Auth & database",
        "APIs & integrations",
        "Payments",
        "Admin dashboards",
        "Deployment & monitoring",
      ],
      process: [
        "Call — scope the product, its users and the first release.",
        "Build — design the UX and engineer the web and mobile app.",
        "Launch — deploy with payments, dashboards and monitoring live.",
      ],
      timeline: "TODO(AB)",
      pricing: "TODO(AB)",
      faqs: [],
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
      title: "Fashion & D2C commerce",
      summary: "Branding and custom storefronts for fashion and D2C labels.",
      forWho: "Fashion and D2C founders launching a store that has to sell and look premium.",
      deliverables: [
        "Shopify store",
        "Custom theme",
        "Catalogue & collections setup",
        "Payment gateway",
        "Size/measurement tools",
        "Lookbook pages",
        "Launch checklist",
      ],
      process: [
        "Call — plan the store, catalogue and launch.",
        "Build — design a custom theme and set up the storefront.",
        "Launch — go live with payments, lookbooks and a launch checklist.",
      ],
      timeline: "TODO(AB)",
      pricing: "TODO(AB)",
      faqs: [],
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
      title: "Brand identity & packaging",
      summary: "Logos, identity systems and packaging built with intent.",
      forWho: "Founders who need a brand that looks as good as the idea behind it.",
      deliverables: [
        "Logo & mark",
        "Colour & type system",
        "Brand guidelines",
        "Labels & packaging",
        "Print-ready files",
        "Social templates",
      ],
      process: [
        "Call — understand the brand, its audience and where it shows up.",
        "Build — design the mark, system, packaging and guidelines.",
        "Launch — hand over print-ready files and social templates.",
      ],
      timeline: "TODO(AB)",
      pricing: "TODO(AB)",
      faqs: [],
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
      title: "Growth",
      summary: "SEO, content, social and ads run by the team that built your site.",
      forWho: "Founders who want marketing that matches the product, not vanity metrics.",
      deliverables: [
        "SEO/AEO/GEO",
        "Content strategy",
        "Social media management",
        "Ad campaign setup",
        "Analytics & reporting",
      ],
      process: [
        "Call — agree the goals, channels and what success looks like.",
        "Build — set up SEO, content, social and campaigns.",
        "Launch — run, measure and report against the outcome.",
      ],
      timeline: "TODO(AB)",
      pricing: "TODO(AB)",
      faqs: [],
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
      title: "Video & motion",
      summary: "Brand films, product videos and motion, in-house.",
      forWho: "Founders who need video that speaks the same language as the brand.",
      deliverables: [
        "Brand films",
        "Product videos",
        "Reels/short-form",
        "Motion graphics",
        "Editing & colour",
      ],
      process: [
        "Call — plan the story, format and where it runs.",
        "Build — shoot or create, then edit, grade and add motion.",
        "Launch — deliver cuts sized for every channel.",
      ],
      timeline: "TODO(AB)",
      pricing: "TODO(AB)",
      faqs: [],
    },
  ] satisfies ServiceDef[],

  // Home page sections after the hero (Phase 4a). Single source of truth: the
  // section components read every string from here — no hardcoded copy in JSX.
  // Founder-voice, plain. No invented numbers, clients or testimonials.
  home: {
    // 1 — Brand / Site / App pillars. Continues the hero's Brand./Site./App.
    // stages; each links to the closest of the 6 locked service pages.
    pillars: {
      eyebrow: "One roof",
      title: "Brand, site, app. One roof.",
      items: [
        {
          index: "01",
          title: "Brand",
          body: "Logos, identity and packaging with a point of view — a system you can build on, not a template that shows.",
          slug: "branding-packaging",
          linkLabel: "Branding & Packaging",
        },
        {
          index: "02",
          title: "Site",
          body: "Custom-coded websites, designed and built by one team. What you approve in design is what ships — no handoff, no drift.",
          slug: "web-and-brand",
          linkLabel: "Web + Brand",
        },
        {
          index: "03",
          title: "App",
          body: "Web and product engineering, from first MVP to launch — fast, custom-coded and ready for real users.",
          slug: "product-app-engineering",
          linkLabel: "Product & App Engineering",
        },
      ],
    },

    // 2 — How it works: three plain steps, one sentence each.
    process: {
      eyebrow: "How it works",
      title: "From first call to live.",
      steps: [
        {
          index: "01",
          title: "Call",
          body: "We talk through your idea, your timeline and what launch actually needs to include.",
        },
        {
          index: "02",
          title: "Build",
          body: "One team designs and codes it — brand, site and app move together, nothing lost in handoff.",
        },
        {
          index: "03",
          title: "Launch",
          body: "We ship it live and stay accountable for how it performs, not just the files we hand over.",
        },
      ],
    },

    // 3 — At a glance. Values are placeholders ("—") until real figures are
    // confirmed by AB. NEVER invent numbers — each tile is marked TODO(AB) in
    // HomeStats.tsx. Labels are stable; only the value strings change later.
    stats: {
      eyebrow: "At a glance",
      title: "The studio, in short.",
      note: "Real numbers land here as we ship — we show, we don't claim.",
      items: [
        { value: "—", label: "Projects shipped" },
        { value: "—", label: "Countries worked across" },
        { value: "—", label: "Services under one roof" },
        { value: "—", label: "Avg. weeks to launch" },
      ],
    },

    // 4 — Services section heading. The cards themselves come from the shared
    // top-level `services` array (reused by Phase 6), so only the section's
    // heading copy lives here.
    servicesSection: {
      eyebrow: "What we do",
      title: "Everything under one roof.",
    },

    // 6 — Selected work section heading. Cards come from the top-level `work`
    // array; the "all" link targets /work.
    workSection: {
      eyebrow: "Selected work",
      title: "Recent work.",
      allLabel: "All work",
    },
  },

  // Stack (Phase 4b, section 5) — replaces the old "8 pillars". Text only, no
  // logos or icons. One row per category; rendered as a <dl> (dt = category,
  // dd = items). All visible, no carousel or marquee.
  stack: {
    eyebrow: "Stack",
    title: "What we build with.",
    categories: [
      { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML", "CSS", "Bash", "Java", "C++"] },
      { category: "Frontend", items: ["React 19", "TanStack Start", "TanStack Router", "TanStack Query", "Next.js", "Vite", "Tailwind CSS", "WebGL"] },
      { category: "Mobile", items: ["Capacitor", "PWA"] },
      { category: "Backend & runtime", items: ["Node.js", "Bun", "Express", "REST APIs", "Server functions"] },
      { category: "Databases", items: ["PostgreSQL", "Supabase", "MongoDB"] },
      { category: "Cloud & DevOps", items: ["Cloudflare Workers", "Cloudflare R2", "AWS (EC2, S3, Lambda, CloudFront)", "Vercel", "Docker", "Linux", "Nginx", "GitHub Actions"] },
      { category: "Commerce & payments", items: ["Shopify", "Liquid", "Razorpay", "Stripe"] },
      { category: "Design", items: ["Figma", "Adobe Illustrator", "Adobe Photoshop", "Adobe Premiere Pro", "After Effects"] },
      { category: "SEO & analytics", items: ["Google Search Console", "GA4", "Schema.org JSON-LD", "Lighthouse"] },
      { category: "Tooling", items: ["Git", "GitHub", "VS Code", "Postman"] },
    ],
  },

  // Selected work (Phase 4b, section 6) — placeholder cards until real case
  // studies exist. NO invented client names: titles/summaries are TODO(AB) and
  // slugs are neutral + structural. Each links to /work/{slug}; "All work →"
  // links to /work. (The /work/$slug route 404s until real data is added.)
  work: [
    { slug: "project-one", title: "TODO(AB)", category: "Web + Brand", summary: "TODO(AB)" },
    { slug: "project-two", title: "TODO(AB)", category: "Fashion & D2C", summary: "TODO(AB)" },
    { slug: "project-three", title: "TODO(AB)", category: "Product & App Engineering", summary: "TODO(AB)" },
  ],

  // Contact CTA (Phase 4b, section 7). The tagline "Idea to launched." is used
  // as the heading here — kept on its own line, never beside the descriptor.
  // Button reuses `cta` below; email is the secondary mailto.
  contact: {
    email: "info@aditeraction.com",
    eyebrow: "Let's talk",
    title: "Idea to launched.",
    body: "Tell us what you're building — brand, site, app, or all three. One team takes it from the first call to live.",
  },

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
  // entries are added here. TODO(AB): add { label, href } once confirmed.
  socials: [] as { label: string; href: string }[],
} as const;

export type Site = typeof site;

export function getService(slug: string): ServiceDef | undefined {
  return site.services.find((s) => s.slug === slug);
}
