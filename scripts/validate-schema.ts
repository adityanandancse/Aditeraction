// JSON-LD validator (Phase 7a). No new deps — run with: bun scripts/validate-schema.ts
//
// For every route it rebuilds the page graph from site.ts data (the same builders
// the pages use), serialises with jsonLd(), JSON.parses it, then asserts:
//   • required fields per @type
//   • every {"@id": …} reference resolves to a defined node in the graph
//   • FAQPage text matches the site.ts FAQ source for that page (parity)
//   • BreadcrumbList names match the visible trail
//   • "<" is escaped in the serialised output
// Prints a per-page summary and exits non-zero on any failure.
import { site, getPublishedWork, pickFaqs, type CaseStudy, type Faq } from "~/lib/site";
import {
  fullGraph,
  jsonLd,
  homeGraph,
  servicesHubGraph,
  serviceGraph,
  workHubGraph,
  caseStudyGraph,
  aboutGraph,
  contactGraph,
} from "~/lib/schema";

type Node = Record<string, any>;
interface Page {
  key: string;
  nodes: Node[];
  faqs?: readonly Faq[]; // expected FAQ source (for parity)
  crumbs?: string[]; // expected breadcrumb names
  note?: string;
}

const pages: Page[] = [
  { key: "/", nodes: homeGraph(), faqs: site.faqs },
  {
    key: "/services",
    nodes: servicesHubGraph(),
    faqs: pickFaqs(site.faqGroups.hub),
    crumbs: ["Home", "Services"],
  },
  ...site.services.map((s) => ({
    key: `/services/${s.slug}`,
    nodes: serviceGraph(s),
    faqs: s.faqs,
    crumbs: ["Home", "Services", s.title],
  })),
  { key: "/work", nodes: workHubGraph(), crumbs: ["Home", "Work"] },
  { key: "/about", nodes: aboutGraph(), crumbs: ["Home", "About"] },
  { key: "/contact", nodes: contactGraph(), crumbs: ["Home", "Contact"] },
];

// Synthetic case study — no real published studies exist yet; this only exercises
// the CreativeWork/breadcrumb builder structurally. NOT written to site.ts.
const sampleCS: CaseStudy = {
  slug: "sample",
  title: "Sample Project",
  industry: "D2C fashion",
  region: "UK",
  year: 2025,
  services: ["web-and-brand", "branding-packaging"],
  summary: "A synthetic case study used only to validate the CreativeWork schema builder.",
  published: true,
};
pages.push({
  key: "/work/sample",
  nodes: caseStudyGraph(sampleCS),
  crumbs: ["Home", "Work", "Sample Project"],
  note: "synthetic — no published case studies exist yet",
});

function typesOf(n: Node): string[] {
  const t = n["@type"];
  return Array.isArray(t) ? t : t ? [t] : [];
}

// Collect @ids that are DEFINITIONS (have @type); collect references (objects
// with @id but no @type) anywhere in the tree.
function collectIds(v: unknown, defined: Set<string>, refs: string[]): void {
  if (Array.isArray(v)) {
    v.forEach((x) => collectIds(x, defined, refs));
    return;
  }
  if (v && typeof v === "object") {
    const o = v as Node;
    const id = o["@id"];
    if (typeof id === "string") {
      if (o["@type"]) defined.add(id);
      else refs.push(id);
    }
    for (const val of Object.values(o)) collectIds(val, defined, refs);
  }
}

const REQUIRED: Record<string, string[]> = {
  Organization: ["name", "url", "@id", "logo"],
  WebSite: ["name", "url", "@id"],
  Person: ["name", "@id"],
  WebPage: ["@id", "url"],
  CollectionPage: ["@id", "url"],
  AboutPage: ["@id", "url"],
  ContactPage: ["@id", "url"],
  Service: ["name", "provider", "@id"],
  CreativeWork: ["name", "description"],
};

let failures = 0;

for (const page of pages) {
  const errors: string[] = [];
  const graph = fullGraph(page.nodes);
  const str = jsonLd(graph);

  // Escaping + valid JSON
  if (str.includes("<")) errors.push("serialised output contains a raw '<'");
  let doc: any;
  try {
    doc = JSON.parse(str);
  } catch (e) {
    errors.push(`invalid JSON: ${(e as Error).message}`);
  }

  if (doc) {
    if (doc["@context"] !== "https://schema.org") errors.push("missing/invalid @context");
    const g: Node[] = doc["@graph"] ?? [];

    // Required fields per type
    for (const node of g) {
      for (const t of typesOf(node)) {
        for (const req of REQUIRED[t] ?? []) {
          if (node[req] === undefined) errors.push(`${t} missing required "${req}"`);
        }
      }
    }

    // @id reference resolution
    const defined = new Set<string>();
    const refs: string[] = [];
    collectIds(g, defined, refs);
    for (const r of refs) {
      if (!defined.has(r)) errors.push(`unresolved @id reference: ${r}`);
    }

    // Site-wide nodes present
    for (const id of [`${site.url}/#organization`, `${site.url}/#website`, `${site.url}/#founder`]) {
      if (!defined.has(id)) errors.push(`missing site-wide node ${id}`);
    }

    // FAQ parity
    const faqNode = g.find((n) => typesOf(n).includes("FAQPage"));
    if (page.faqs && page.faqs.length > 0) {
      if (!faqNode) errors.push("expected a FAQPage node, none found");
      else {
        const got = (faqNode.mainEntity as Node[]).map((q) => ({
          q: q.name,
          a: q.acceptedAnswer?.text,
        }));
        const want = page.faqs.map((f) => ({ q: f.q, a: f.a }));
        if (JSON.stringify(got) !== JSON.stringify(want))
          errors.push(`FAQPage text does not match site.ts source (${got.length} vs ${want.length})`);
      }
    } else if (faqNode) {
      errors.push("unexpected FAQPage node on a page with no rendered FAQs");
    }

    // Breadcrumb parity
    const bc = g.find((n) => typesOf(n).includes("BreadcrumbList"));
    if (page.crumbs) {
      if (!bc) errors.push("expected a BreadcrumbList, none found");
      else {
        const names = (bc.itemListElement as Node[]).map((li) => li.name);
        if (JSON.stringify(names) !== JSON.stringify(page.crumbs))
          errors.push(`breadcrumb names ${JSON.stringify(names)} != ${JSON.stringify(page.crumbs)}`);
      }
    } else if (bc) {
      errors.push("unexpected BreadcrumbList on Home");
    }
  }

  const nodeCount = (doc?.["@graph"]?.length ?? 0) as number;
  const typeList = (doc?.["@graph"] ?? []).flatMap((n: Node) => typesOf(n)).join(", ");
  const status = errors.length === 0 ? "PASS" : "FAIL";
  if (errors.length) failures++;
  const noteStr = page.note ? `  (${page.note})` : "";
  console.log(`\n${status}  ${page.key}${noteStr}`);
  console.log(`      ${nodeCount} nodes · bytes ${str.length} · types: ${typeList}`);
  errors.forEach((e) => console.log(`      ✗ ${e}`));
}

console.log(
  `\n${failures === 0 ? "ALL PAGES VALID" : `${failures} PAGE(S) FAILED`} · published case studies: ${getPublishedWork().length} (so /work/$slug is 404 for every slug today)`,
);
process.exit(failures === 0 ? 0 : 1);
