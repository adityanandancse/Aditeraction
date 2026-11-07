// Single source of truth for Aditeraction site content and structure.
// Nav + footer mirror .agents/seo/01-site-architecture.md. Services match the
// 6 locked slugs. No invented URLs, handles, stats or client facts anywhere.

export interface Faq {
  q: string;
  a: string;
}

// Founder profile (Phase 5a) — feeds About/Person schema in Phase 7. Facts only.
export interface Founder {
  name: string;
  role: string;
  since: number;
  education: string;
  location: string;
  bio: string;
}

// Self-contained, answer-engine-ready block (Phase 5a). First sentence answers
// directly and names "Aditeraction"; `words` is a 40–60 word check on `answer`.
export interface AnswerBlock {
  question: string;
  answer: string;
  words: number;
}

export interface ServiceDef {
  slug: string;
  name: string; // nav / card label (e.g. "Web & Brand")
  short: string; // one-line nav/footer description
  seoTitle: string; // <title> — pattern from 02-seo-plan.md
  seoDescription: string; // meta description — from 02-seo-plan.md
  intro: string; // real on-page paragraph (no lorem ipsum)
  // Phase 4b additions — the full service data model, reused by Phase 6 pages.
  title: string; // canonical display name, matches `name` (e.g. "Web & Brand")
  summary: string; // one-line summary
  forWho: string; // one-line "who it's for"
  deliverables: readonly string[];
  process: readonly string[]; // Call / Build / Launch wording for this service
  timeline: string; // TODO(AB) — real timeline once confirmed
  pricing: string; // TODO(AB) — real pricing once confirmed
  faqs: readonly Faq[]; // TODO(AB) — empty until written
  plans: readonly string[]; // plan ids (site.plans) whose scope includes this service
}

// Static routes used in nav/footer (keeps TanStack's typed `to` happy).
export type AppPath = "/" | "/services" | "/work" | "/about" | "/contact";

export interface NavItem {
  label: string;
  to: AppPath;
}

// Case study (Phase 6b). Optional fields render ONLY when present — no invented
// clients, numbers, quotes or results. `metrics`/`quote` must be real + verified.
// `services` are service slugs. `published: false` placeholders never render as
// pages (the loader resolves published only). Feeds CreativeWork schema (Phase 7).
export interface CaseMetric {
  label: string;
  value: string;
}
export interface CaseQuote {
  text: string;
  author: string;
  role: string;
}
export interface CaseStudy {
  slug: string;
  title: string;
  client?: string; // may be anonymised, e.g. "D2C fashion label, UK"
  industry: string;
  region: string;
  year?: number;
  services: readonly string[]; // service slugs (see services[].slug)
  summary: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  deliverables?: readonly string[];
  stack?: readonly string[];
  metrics?: readonly CaseMetric[]; // real, verified figures only
  quote?: CaseQuote; // real quotes only
  url?: string; // live site, if public
  published: boolean;
}

export const site = {
  name: "Aditeraction",
  url: "https://aditeraction.com",
  tagline: "Idea to launched.", // never on the same visual line as the descriptor
  descriptor: "Brand, site, app. One roof.",
  email: "info@aditeraction.com",

  // Founder (Phase 5a). Bio is founder-approved copy; `founder.name` replaces the
  // old `founder: "Aditya"` string (see about.tsx / Footer.tsx usages).
  founder: {
    name: "Aditya",
    role: "Founder",
    since: 2019,
    education: "B.Tech, Computer Science and Engineering",
    location: "Noida, India",
    bio: "Aditya is the founder of Aditeraction and has been building for the web since 2019. A B.Tech graduate in Computer Science and Engineering, he designs and builds brands, websites and apps for startups — work that has helped them grow sales and visibility. Aditeraction is based in Noida, India, and works with clients worldwide.",
  } satisfies Founder,
  // Core message (real copy from brand context) — used on Home.
  coreMessage:
    "Aditeraction is a founder-led design-and-engineering studio. The same team designs your brand and writes the production code that ships it — so nothing is lost between a nice mockup and a live product. For founders in India and worldwide.",

  // Answer-engine blocks (Phase 5a). Each is a self-contained 40–60 word answer
  // whose first sentence answers the question directly and names "Aditeraction"
  // (featured-snippet / AI-citation style). Data only — no UI until Phase 6/7.
  answers: {
    whatWeDo: {
      question: "What does Aditeraction do?",
      answer:
        "Aditeraction is a founder-led design and engineering studio that takes founders from idea to launched brand, site and app. The same team designs the brand and writes the production code, so nothing is lost in handoff. We work with new businesses and established ones with no digital presence, worldwide, across fashion, textiles, D2C, restaurants and real estate.",
      words: 57,
    },
    pricing: {
      question: "How much does a project with Aditeraction cost?",
      answer:
        "Pricing is on request, and every Aditeraction project is quoted to its scope. What you pay depends on the scope of work, the number of pages or products, and how complex any app is. Payment splits 60% upfront and 40% at launch, so cost tracks the work.",
      words: 47,
    },
    timelines: {
      question: "How long does an Aditeraction project take?",
      answer:
        "A typical Aditeraction project runs three to sixteen weeks, depending on the plan. Launch (brand and site) takes 3–4 weeks; Grow (brand, site and reach) takes 6–8 weeks; One Roof (brand, site and app) takes 10–16 weeks, scoped after a discovery call. We set honest timelines up front.",
      words: 48,
    },
  } satisfies Record<string, AnswerBlock>,

  // Global FAQs (Phase 5a) — 14 Q&As, every answer 40–60 words, built only from
  // founder-supplied facts. Rendered as a FAQ section + FAQPage schema later.
  faqs: [
    {
      q: "What does Aditeraction do?",
      a: "Aditeraction is a founder-led design and engineering studio. We design your brand and write the production code behind your website and apps, so one team takes you from idea to launched. We cover brand, site, app, marketing and video, with everything in between handled under one roof.",
    },
    {
      q: "Who is Aditeraction for?",
      a: "We work with founders and businesses that are either brand new, or established but with no digital presence yet. Any industry — we've delivered for fashion, textiles, D2C, restaurants and real estate. Clients are based in India and worldwide, so wherever you're starting from, Aditeraction takes you from idea to launched.",
    },
    {
      q: "How much does a project cost?",
      a: "Every project is quoted to its scope, so pricing is shared on request rather than as a fixed list. Your quote depends on the scope of work, the number of pages or products, and how complex any app is. We split payment 60% upfront and 40% at launch.",
    },
    {
      q: "How long does a project take?",
      a: "It depends on the plan. Launch, our brand and site plan, takes 3–4 weeks. Grow, which adds reach, takes 6–8 weeks. One Roof, which adds an app, takes 10–16 weeks and is scoped after a discovery call. We agree an honest timeline before we start.",
    },
    {
      q: "What plans do you offer?",
      a: "We offer three plans, each quoted to scope. Launch covers brand and site in 3–4 weeks. Grow adds reach (marketing and social media) in 6–8 weeks. One Roof adds a custom app in 10–16 weeks, scoped after a discovery call. Every plan includes two revision rounds.",
    },
    {
      q: "How do payments work?",
      a: "We split payment into two stages: 60% upfront to begin the work, and the remaining 40% at launch. This keeps things simple and ties each payment to real progress. You pay to start, then pay the balance when your brand, site or app goes live.",
    },
    {
      q: "What currencies and payment methods do you accept?",
      a: "In India, we invoice in INR and take payment by bank transfer or UPI. For international clients, we invoice in USD, EUR or GBP and take payment through PayPal or Stripe. Whichever applies, the 60% upfront and 40% at launch split stays the same.",
    },
    {
      q: "How many revisions are included?",
      a: "Every project includes two rounds of revisions at no extra cost. After we share work, you give feedback and we refine, twice, so the brand, site or app lands where you want it. If the scope itself changes, we talk it through and quote the extra work honestly.",
    },
    {
      q: "Who owns the work once it's done?",
      a: "You do. Once the final 40% is paid, you get full ownership of everything we make: the brand files, the source code, the domain and all accounts. Nothing is locked to us or held back. It's your business, so the work and the logins belong to you.",
    },
    {
      q: "What support do you get after launch?",
      a: "Every launch comes with one week of free support, so we're on hand to fix anything that surfaces as your brand, site or app goes live. After that week, you can keep us on through the optional Care plan, or simply reach out when you next need us.",
    },
    {
      q: "Do you work with international clients across time zones?",
      a: "Yes. We work with clients in the UAE, UK, USA, Canada, Australia, Singapore and across India. We keep in touch by email and video call, reply within 24 hours on working days, and schedule calls to overlap your hours, not ours. Time zones don't change how closely we work with you.",
    },
    {
      q: "Do you use templates or custom code?",
      a: "Custom, always. We write our own code rather than dropping your business into a template or page builder, so the site or app is fast, built around your brand, and yours to own. It costs a little more thought up front, and it's why nothing we ship looks off-the-shelf.",
    },
    {
      q: "What is the Care plan?",
      a: "The Care plan is an optional monthly add-on that keeps your site or app healthy after launch. It covers hosting, updates, regular performance checks and up to 2 hours of changes per month, so things stay fast and current without you thinking about them. You can add it to any plan, or skip it.",
    },
    {
      q: "How do I get started?",
      a: "Tell us what you're building. Email us at info@aditeraction.com, and we'll talk through your idea, your timeline and what launch needs to include. From there we scope the work and share a quote. Once you're happy and the 60% deposit lands, we start.",
    },
  ] satisfies readonly Faq[],

  // Which global FAQs render on which page (single source for both the rendered
  // FaqList and the FAQPage JSON-LD, so schema ↔ page parity can't drift).
  faqGroups: {
    hub: [
      "How much does a project cost?",
      "How long does a project take?",
      "What plans do you offer?",
      "How do payments work?",
      "Who owns the work once it's done?",
      "How many revisions are included?",
    ],
    contact: [
      "How do I get started?",
      "How do payments work?",
      "What currencies and payment methods do you accept?",
      "Do you work with international clients across time zones?",
    ],
  },

  // The 6 locked service lines (slugs from 01-site-architecture.md).
  services: [
    {
      slug: "web-and-brand",
      plans: ["launch", "grow"],
      name: "Web & Brand",
      short: "Custom-coded websites and brand identity from one team.",
      seoTitle: "Web design & branding studio — Aditeraction",
      seoDescription:
        "Custom-coded websites and brand identity from one team — no handoff, no templates. Idea to launched for founders, India and worldwide.",
      intro:
        "Your brand and your website, designed and built by one team. We draw the identity and write the production code, so what you approve in design is what ships — no handoff, no templates, no drift between mockup and live site.",
      title: "Web & Brand",
      summary: "Custom-coded websites, designed and built by one team.",
      forWho: "Founders who need a site that looks premium and loads fast — not a template.",
      deliverables: [
        "Logo & brand essentials (mark, colour & type system, brand guide)",
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
      timeline: "From 3–4 weeks",
      pricing: "On request",
      faqs: [
        {
          q: "What does the Web & Brand service include?",
          a: "Web & Brand covers both your identity and your website, built by one team. You get the brand (logo, colour and type system, guidelines) and a responsive, custom-coded site with a CMS, SEO foundations and analytics. Because the same team designs and builds, what you approve is what ships.",
        },
        {
          q: "How long does a Web & Brand project take?",
          a: "From 3–4 weeks for a focused brand and site, which lines up with our Launch plan. Larger sites with more pages, a bigger identity system or a store take longer, and we give you an honest timeline once we've scoped the pages, content and goals on a first call.",
        },
        {
          q: "Do I own the website and brand files?",
          a: "Yes. Once the final 40% is paid, the brand files, the source code, the domain and every account are yours in full. We build on custom code rather than a locked template, so you're never tied to us to host, edit or move your site later.",
        },
      ],
    },
    {
      slug: "product-app-engineering",
      plans: ["one-roof"],
      name: "Product & App Engineering",
      short: "Custom web and app engineering, MVP to launch.",
      seoTitle: "Product & app engineering studio — Aditeraction",
      seoDescription:
        "Custom web and app engineering (React, SSR) for founders — MVP to launch. Design and code under one roof. India and worldwide.",
      intro:
        "Custom web and app engineering, from first MVP to launched product. We design what we can build and build what we design, so the product you ship feels as considered as the pitch — fast, custom-coded, and ready for real users.",
      title: "Product & App Engineering",
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
      timeline: "10–16 weeks",
      pricing: "On request",
      faqs: [
        {
          q: "What does Product & App Engineering include?",
          a: "We design and engineer custom web and mobile apps, from first MVP to launched product. That spans product scoping, UX and UI, the web app, iOS and Android via Capacitor, auth and database, payments, admin dashboards, and deployment with monitoring. Design and code are handled by one team.",
        },
        {
          q: "How long does it take to build an app?",
          a: "10–16 weeks for a first version, scoped after a discovery call, which is our One Roof range. The exact timeline depends on how complex the app is: the number of features, the integrations, and whether it ships on web, iOS and Android. We set the plan together before we build.",
        },
        {
          q: "Who owns the product and the code?",
          a: "You own all of it. When the final 40% is paid, the full source code, accounts and any domains transfer to you. We write custom code rather than lock you into a platform, so your product stays yours to run, extend or hand to another team whenever you choose.",
        },
      ],
    },
    {
      slug: "fashion-d2c",
      plans: ["grow"],
      name: "Fashion & D2C",
      short: "Branding and custom storefronts for fashion and D2C.",
      seoTitle: "Fashion & D2C brand and website studio — Aditeraction",
      seoDescription:
        "Branding, packaging and custom Shopify/web for fashion and D2C founders. One team, idea to launched. India and worldwide.",
      intro:
        "Branding, packaging and custom storefronts for fashion and D2C founders. One team takes the label from identity to a storefront that sells — considered, fast and built to look as premium as the product inside.",
      title: "Fashion & D2C",
      summary: "Branding and custom storefronts for fashion and D2C labels.",
      forWho: "Fashion and D2C founders launching a store that has to sell and look premium.",
      deliverables: [
        "Labels & packaging design",
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
      timeline: "From 6–8 weeks",
      pricing: "On request",
      faqs: [
        {
          q: "What does the Fashion & D2C service include?",
          a: "We take fashion and D2C labels from identity to a storefront that sells. That covers branding and packaging, a custom Shopify or web store, catalogue and collections setup, payment gateway, size and measurement tools, lookbook pages and a launch checklist, all designed and built by one team.",
        },
        {
          q: "How long does a D2C store take to launch?",
          a: "Around 6–8 weeks, in line with our Grow plan, for branding plus a custom store ready to sell. The timeline moves with the size of your catalogue, the number of products and how custom the theme is. We confirm it once we've planned the store and launch on a first call.",
        },
        {
          q: "Do you design the packaging as well as the store?",
          a: "Yes. Fashion and D2C brands usually need both, so this service pairs packaging and label design with the storefront. One team keeps the label, the lookbook and the website speaking the same language, so what a customer sees online matches what lands at their door when the order arrives.",
        },
      ],
    },
    {
      slug: "branding-packaging",
      plans: ["launch", "grow", "one-roof"],
      name: "Branding & Packaging",
      short: "Logos, brand identity and packaging with intent.",
      seoTitle: "Branding & packaging design studio — Aditeraction",
      seoDescription:
        "Logos, brand identity and packaging that look as good as your idea. Founder-led, premium craft, accessible pricing. India and worldwide.",
      intro:
        "Logos, brand identity and packaging that look as good as your idea. Every mark, colour and surface is intentional — a system you can build on, not a template that shows. Premium craft at a lean studio's pace.",
      title: "Branding & Packaging",
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
      timeline: "Scoped on a discovery call",
      pricing: "On request",
      faqs: [
        {
          q: "What does the Branding & Packaging service include?",
          a: "You get a full identity built with intent: a logo and mark, a colour and type system, brand guidelines, labels and packaging, print-ready files and social templates. Every mark and surface is designed as a system you can build on, not a template that shows, and handed over ready to use.",
        },
        {
          q: "How long does branding and packaging take?",
          a: "It's scoped on a discovery call, because the timeline depends on how much you need: a single logo and guide moves quickly, a full identity with packaging and print files takes longer. Once we understand the brand, its audience and where it shows up, we give you an honest schedule.",
        },
        {
          q: "Do I get print-ready files I can hand to a printer?",
          a: "Yes. The handover includes print-ready files for your labels and packaging, plus social templates you can reuse. Once the final 40% is paid, all of it is yours to own and use anywhere (with a supplier, a printer or another designer), with no need to come back to us.",
        },
      ],
    },
    {
      slug: "digital-marketing",
      plans: ["grow", "one-roof"],
      name: "Digital Marketing",
      short: "SEO, social and ads by the team that built your site.",
      seoTitle: "Digital marketing for founders — Aditeraction",
      seoDescription:
        "SEO, social and ads run by the team that built your brand and site. Honest, measurable, founder-led. India and worldwide.",
      intro:
        "SEO, social and ads run by the same team that built your brand and site. Because we own the whole picture, the marketing matches the product — honest, measurable, and pointed at the outcome rather than vanity numbers.",
      title: "Digital Marketing",
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
      timeline: "Scoped on a discovery call",
      pricing: "On request",
      faqs: [
        {
          q: "What does the Digital Marketing service include?",
          a: "The team that built your brand and site runs the marketing too: SEO, AEO and GEO, content strategy, social media management, ad campaign setup, and analytics with reporting. Because we own the whole picture, the marketing matches the product and points at real outcomes rather than vanity numbers.",
        },
        {
          q: "How long before I see results from marketing?",
          a: "Marketing is scoped on a discovery call, because the work and the timeline depend on your goals and channels. We agree what success looks like up front, then set up SEO, content, social and campaigns, and report against that outcome. We say straight what's realistic rather than promising overnight numbers.",
        },
        {
          q: "Can you handle marketing if you didn't build my site?",
          a: "Yes, though we're at our best when the marketing sits on a brand and site we also built, because nothing is lost between them. Either way, we agree goals and channels on a discovery call, set up the work, and report honestly on what's moving and what isn't.",
        },
      ],
    },
    {
      slug: "video",
      plans: ["grow", "one-roof"],
      name: "Video",
      short: "Launch, brand and product video, in-house.",
      seoTitle: "Brand & product video studio — Aditeraction",
      seoDescription:
        "Launch, brand and product video from the studio that ships your site and brand. One team, one timeline. India and worldwide.",
      intro:
        "Launch films, brand video and product motion from the studio that already ships your site and brand. One team and one timeline, so the film speaks the same language as everything else you put in front of customers.",
      title: "Video",
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
      timeline: "Scoped on a discovery call",
      pricing: "On request",
      faqs: [
        {
          q: "What does the Video service include?",
          a: "We make launch films, brand video, product videos, reels and short-form, plus motion graphics, editing and colour, all in-house, from the studio that already ships your site and brand. One team and one timeline keep the film speaking the same language as everything else you put in front of customers.",
        },
        {
          q: "How long does a video project take?",
          a: "It's scoped on a discovery call, because a single product reel and a full launch film are very different jobs. Once we know the story, the format and where it runs, we give you an honest timeline for the shoot or build, then editing, grading and motion.",
        },
        {
          q: "Will the video match the rest of my brand?",
          a: "That's the point of keeping it in-house. Because the same studio makes your brand, site and video, the film uses the same identity, type and tone as everything else. You get cuts sized for every channel, all speaking one language rather than looking like they came from three suppliers.",
        },
      ],
    },
  ] satisfies ServiceDef[],

  // Industries we've delivered for (Phase 5d). Openness stays "any industry";
  // this is the delivered-for list only — no counts, no client names.
  industries: ["Fashion", "Textiles", "D2C", "Restaurants", "Real estate"],

  // How we work (Phase 6b) — single source for the /about "How we work" list.
  // Every line is from founder-supplied facts (payments, currencies, revisions,
  // ownership, support/Care plan, communication). No invented figures.
  howWeWork: [
    { label: "Communication", body: "Email and video calls. We reply within 24 hours on working days and schedule calls to overlap your hours." },
    { label: "Payment", body: "60% upfront to begin, 40% at launch." },
    { label: "Currencies", body: "India: INR by bank transfer or UPI. International: USD, EUR or GBP via PayPal or Stripe." },
    { label: "Revisions", body: "Two revision rounds included at no extra cost." },
    { label: "Ownership", body: "Full ownership of your brand files, source code, domain and accounts once the final 40% is paid." },
    { label: "Support", body: "One week of free support after launch, then the optional Care plan — up to 2 hours of changes a month, plus hosting, updates and performance checks." },
  ],

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
          linkLabel: "Web & Brand",
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

    // 3 — At a glance. KEPT AS DATA but NOT rendered (Phase 5c): HomeReach now
    // occupies this slot. Re-enable HomeStats once real figures exist — values are
    // placeholders ("—") until then, never invented.
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

    // 3 (Phase 5c) — World reach. Replaces the stats section in the same slot.
    // Dotted world map (src/assets/world-dots.svg) + animated arcs from Noida to
    // each client region, projected via src/lib/worldProjection.ts. Facts only:
    // based in Noida; clients in UAE, UK, USA, Canada, Australia, Singapore and
    // across India. No counts. `local: true` → ring around Noida, not an arc.
    reach: {
      eyebrow: "Worldwide",
      title: "Based in Noida. Working worldwide.",
      body: "We work with founders across India and around the world — from the first call to launch, across time zones.",
      origin: { label: "Noida, India", lat: 28.54, lng: 77.39 },
      regions: [
        { label: "Across India", lat: 21.0, lng: 78.0, local: true },
        { label: "UAE", lat: 24.4, lng: 54.4 },
        { label: "UK", lat: 52.5, lng: -1.5 },
        { label: "USA", lat: 39.5, lng: -98.4 },
        { label: "Canada", lat: 56.1, lng: -106.3 },
        { label: "Australia", lat: -25.3, lng: 133.8 },
        { label: "Singapore", lat: 1.35, lng: 103.82 },
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

    // 4c (A) — Plans section heading. The cards come from the top-level `plans`
    // array; only the heading copy lives here (matches servicesSection/workSection).
    plansSection: {
      eyebrow: "Plans",
      title: "Pick the plan that fits.",
    },

    // 4c (B) — Why Aditeraction. Numbered reasons (01–05), one line each.
    why: {
      eyebrow: "Why us",
      title: "One owner. Brand to code.",
      points: [
        {
          title: "One owner, brand to code",
          body: "The person who shapes your brand builds your site. Nothing gets lost in handoffs.",
        },
        {
          title: "Fast",
          body: "Launch in weeks, not quarters.",
        },
        {
          title: "Built properly",
          body: "Custom code, not templates. Fast, accessible and search-ready from day one.",
        },
        {
          title: "Founder-run",
          body: "We run businesses ourselves, so we build for revenue, not awards.",
        },
        {
          title: "Everything in between",
          body: "Domain, email, hosting, profiles and launch — handled. Two revision rounds are included at no extra cost.",
        },
      ],
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

  // Selected work (Phase 4b/6b) — placeholder case studies until real projects
  // land. NO invented clients, numbers, quotes or results: every field is a
  // TODO(AB) placeholder and `published: false`, so none is reachable as a page
  // (the /work/$slug loader resolves published only) and /work shows an honest
  // empty state. `services` carry real slugs so the home grid can label the card.
  work: [
    { slug: "project-one", title: "TODO(AB)", industry: "TODO(AB)", region: "TODO(AB)", services: ["web-and-brand"], summary: "TODO(AB)", published: false },
    { slug: "project-two", title: "TODO(AB)", industry: "TODO(AB)", region: "TODO(AB)", services: ["fashion-d2c"], summary: "TODO(AB)", published: false },
    { slug: "project-three", title: "TODO(AB)", industry: "TODO(AB)", region: "TODO(AB)", services: ["product-app-engineering"], summary: "TODO(AB)", published: false },
  ] satisfies CaseStudy[],

  // Plans (Phase 4c, section A) — three tiers, each quoted to scope (no prices
  // invented; see `plansNote`). `includesPrevious` drives the "Everything in
  // {previous plan}, plus:" line. ctaHref carries the chosen plan to /contact.
  plans: [
    {
      id: "launch",
      name: "Launch",
      label: "Brand + site",
      forWho: "For businesses starting from zero that need to look real online.",
      includesPrevious: false,
      items: [
        "Logo/mark, colour & type system, one-page brand guide",
        "Website up to 5 pages, responsive and fast",
        "Domain, business email & hosting setup",
        "SEO basics: metadata, sitemap, Search Console, analytics",
        "Google Business Profile + 2 social profiles set up",
      ],
      timeline: "3–4 weeks",
      ctaLabel: "Get a quote",
      ctaHref: "/contact?plan=launch",
    },
    {
      id: "grow",
      name: "Grow",
      label: "Brand + site + reach",
      forWho: "For businesses ready to sell and be found.",
      includesPrevious: true,
      items: [
        "Full identity system with brand guidelines",
        "Website up to 12 pages with CMS/blog, or a Shopify store",
        "SEO/AEO/GEO foundations: schema, content plan, answer-ready FAQs",
        "Social template kit + reels/short-video pack",
        "1 month of social media management and reporting",
      ],
      timeline: "6–8 weeks",
      ctaLabel: "Get a quote",
      ctaHref: "/contact?plan=grow",
    },
    {
      id: "one-roof",
      name: "One Roof",
      label: "Brand + site + app",
      forWho: "For businesses that need a real product built.",
      includesPrevious: true,
      items: [
        "Custom web app or iOS/Android app (first version)",
        "Auth, database, payments, admin dashboard",
        "Packaging & label design",
        "Brand film or product video",
        "3 months of marketing and SEO",
      ],
      timeline: "10–16 weeks, scoped after a discovery call",
      ctaLabel: "Get a quote",
      ctaHref: "/contact?plan=one-roof",
    },
  ],

  // Optional add-on offered with any plan (shown below the plans grid).
  plansAddon: {
    name: "Care plan",
    body: "Monthly hosting, updates, performance checks and up to 2 hours of changes — available with any plan.",
  },

  // Pricing is always quoted to scope — never a fabricated number.
  plansNote: "Pricing on request — every project is quoted to its scope.",

  // Shown beside plansNote — reassures that revisions are built into every plan.
  plansRevisions: "Every plan includes 2 revision rounds at no extra cost.",

  // Contact CTA (Phase 4b, section 7). The tagline "Idea to launched." is used
  // as the heading here — kept on its own line, never beside the descriptor.
  // Button reuses `cta` below; email is the secondary mailto.
  contact: {
    email: "info@aditeraction.com",
    eyebrow: "Let's talk",
    title: "Idea to launched.",
    body: "Tell us what you're building — brand, site, app, or all three. One team takes it from the first call to live.",
    formEnabled: true, // enquiry form live (Resend delivery via server function)
    formFrom: "Aditeraction Website <forms@mail.aditeraction.com>",
    formTo: "info@aditeraction.com",
    confirmFrom: "Aditya at Aditeraction <hello@mail.aditeraction.com>", // submitter confirmation
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

  // Social profiles — confirmed accounts. Footer renders these as text links with
  // rel="me noopener" target="_blank"; they also feed Organization `sameAs` (Phase 7).
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/aditeraction" },
    { label: "Instagram", href: "https://www.instagram.com/aditeraction/" },
    { label: "Facebook", href: "https://www.facebook.com/aditeraction/" },
    { label: "Pinterest", href: "https://www.pinterest.com/aditeraction/" },
  ] as { label: string; href: string }[],
} as const;

export type Site = typeof site;

export function getService(slug: string): ServiceDef | undefined {
  return site.services.find((s) => s.slug === slug);
}

/** Published case studies only — placeholders (published: false) are excluded. */
export function getPublishedWork(): readonly CaseStudy[] {
  return site.work.filter((w) => w.published);
}

/** Resolve a published case study by slug; undefined for unknown/unpublished. */
export function getCaseStudy(slug: string): CaseStudy | undefined {
  return site.work.find((w) => w.slug === slug && w.published);
}

/** Resolve a list of FAQ question strings to the matching global FAQ objects. */
export function pickFaqs(questions: readonly string[]): Faq[] {
  return questions
    .map((q) => site.faqs.find((f) => f.q === q))
    .filter((f): f is (typeof site.faqs)[number] => Boolean(f));
}
