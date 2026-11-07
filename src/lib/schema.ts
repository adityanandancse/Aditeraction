// JSON-LD structured data (Phase 7a). Pure builders — no React, no DOM — so the
// same graph can be rendered server-side via seo() and independently validated by
// scripts/validate-schema.ts. Every value comes from site.ts; nothing is invented
// (no foundingDate, ratings, reviews, prices, street address or phone).
//
// Stable @ids: {url}/#organization, /#website, /#founder (site-wide, on every
// page); {pageUrl}#webpage, #breadcrumb, #faq, #service (per page).
import {
  site,
  getPublishedWork,
  pickFaqs,
  type CaseStudy,
  type Faq,
  type ServiceDef,
} from "~/lib/site";

type Node = Record<string, unknown>;

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;
const FOUNDER_ID = `${site.url}/#founder`;
const LOGO_URL = `${site.url}/icons/icon-512.png`;

// areaServed — the countries the studio works across (brief/reach). Names only.
const COUNTRIES = [
  "India",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Singapore",
];
const countryNodes = (): Node[] => COUNTRIES.map((name) => ({ "@type": "Country", name }));

/** Absolute page URL for a route path. Home keeps its trailing slash. */
export function pageUrl(path: string): string {
  return path === "/" ? `${site.url}/` : `${site.url}${path}`;
}

const orgRef = () => ({ "@id": ORG_ID });
const websiteRef = () => ({ "@id": WEBSITE_ID });

// ---------------------------------------------------------------- site-wide ---
function organizationNode(): Node {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    logo: {
      "@type": "ImageObject",
      "@id": `${site.url}/#logo`,
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    image: LOGO_URL,
    email: site.contact.email,
    description: site.answers.whatWeDo.answer,
    slogan: site.tagline,
    founder: { "@id": FOUNDER_ID },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    areaServed: countryNodes(),
    sameAs: site.socials.map((s) => s.href),
    knowsAbout: [...site.services.map((s) => s.title), ...site.industries],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: site.contact.email,
      availableLanguage: ["English"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Plans",
      itemListElement: site.plans.map((p) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: p.name, description: p.forWho },
      })),
    },
  };
}

function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: site.url,
    publisher: orgRef(),
    inLanguage: "en",
  };
}

function founderNode(): Node {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: site.founder.name,
    jobTitle: site.founder.role,
    worksFor: orgRef(),
    description: site.founder.bio,
    knowsAbout: site.services.map((s) => s.title),
    homeLocation: { "@type": "Place", name: site.founder.location },
  };
}

/** The three nodes present on every page. */
export function buildSiteGraph(): Node[] {
  return [organizationNode(), websiteNode(), founderNode()];
}

// ------------------------------------------------------------- per-page bits ---
interface Crumb {
  name: string;
  url?: string; // omitted on the current (last) page — mirrors the visible trail
}

function webPageNode(url: string, type: string, extra: Node = {}): Node {
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    isPartOf: websiteRef(),
    about: orgRef(),
    inLanguage: "en",
    ...extra,
  };
}

function breadcrumbNode(url: string, crumbs: Crumb[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.url ? { item: c.url } : {}),
    })),
  };
}

function faqPageNode(url: string, faqs: readonly Faq[]): Node {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function serviceNode(url: string, service: ServiceDef): Node {
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    provider: orgRef(),
    areaServed: countryNodes(),
    url,
  };
}

// ----------------------------------------------------------- page graph fns ---
export function homeGraph(): Node[] {
  const u = pageUrl("/");
  return [webPageNode(u, "WebPage", { name: site.name }), faqPageNode(u, site.faqs)];
}

export function servicesHubGraph(): Node[] {
  const u = pageUrl("/services");
  return [
    webPageNode(u, "CollectionPage", { name: "Services" }),
    breadcrumbNode(u, [{ name: "Home", url: pageUrl("/") }, { name: "Services" }]),
    {
      "@type": "ItemList",
      "@id": `${u}#servicelist`,
      itemListElement: site.services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.title,
        url: pageUrl(`/services/${s.slug}`),
      })),
    },
    faqPageNode(u, pickFaqs(site.faqGroups.hub)),
  ];
}

export function serviceGraph(service: ServiceDef): Node[] {
  const u = pageUrl(`/services/${service.slug}`);
  return [
    webPageNode(u, "WebPage", { name: service.title }),
    breadcrumbNode(u, [
      { name: "Home", url: pageUrl("/") },
      { name: "Services", url: pageUrl("/services") },
      { name: service.title },
    ]),
    serviceNode(u, service),
    faqPageNode(u, service.faqs),
  ];
}

export function workHubGraph(): Node[] {
  const u = pageUrl("/work");
  const published = getPublishedWork();
  const nodes: Node[] = [
    webPageNode(u, "CollectionPage", { name: "Work" }),
    breadcrumbNode(u, [{ name: "Home", url: pageUrl("/") }, { name: "Work" }]),
  ];
  // Omit the ItemList entirely while there are no published case studies.
  if (published.length > 0) {
    nodes.push({
      "@type": "ItemList",
      "@id": `${u}#worklist`,
      itemListElement: published.map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: w.title,
        url: pageUrl(`/work/${w.slug}`),
      })),
    });
  }
  return nodes;
}

export function caseStudyGraph(cs: CaseStudy): Node[] {
  const u = pageUrl(`/work/${cs.slug}`);
  return [
    webPageNode(u, "WebPage", { name: cs.title }),
    breadcrumbNode(u, [
      { name: "Home", url: pageUrl("/") },
      { name: "Work", url: pageUrl("/work") },
      { name: cs.title },
    ]),
    {
      "@type": "CreativeWork",
      "@id": `${u}#creativework`,
      name: cs.title,
      description: cs.summary,
      about: cs.industry,
      creator: orgRef(),
      dateCreated: cs.year ? String(cs.year) : undefined,
      url: u,
      keywords: cs.services.join(", "),
    },
  ];
}

export function aboutGraph(): Node[] {
  const u = pageUrl("/about");
  return [
    webPageNode(u, "AboutPage", { name: "About Aditeraction", mainEntity: orgRef() }),
    breadcrumbNode(u, [{ name: "Home", url: pageUrl("/") }, { name: "About" }]),
  ];
}

export function contactGraph(): Node[] {
  const u = pageUrl("/contact");
  return [
    webPageNode(u, "ContactPage", { name: "Start a project" }),
    breadcrumbNode(u, [{ name: "Home", url: pageUrl("/") }, { name: "Contact" }]),
  ];
}

// ------------------------------------------------------------- serialisation --
/** Recursively drop undefined/null so no empty fields reach the output. */
export function cleanDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((v) => cleanDeep(v))
      .filter((v) => v !== undefined && v !== null) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const c = cleanDeep(v);
      if (c !== undefined && c !== null) out[k] = c;
    }
    return out as T;
  }
  return value;
}

/** Site-wide nodes + this page's nodes, cleaned. */
export function fullGraph(pageNodes: Node[]): Node[] {
  return cleanDeep([...buildSiteGraph(), ...pageNodes]);
}

/**
 * Serialise a graph to the inline-script string. `<` is escaped to its unicode
 * form so the JSON can never break out of the surrounding <script> element.
 * (TanStack renders head scripts via dangerouslySetInnerHTML with no escaping.)
 */
export function jsonLd(graph: Node[]): string {
  const doc = { "@context": "https://schema.org", "@graph": graph };
  return JSON.stringify(doc).replace(/</g, "\\u003c");
}
