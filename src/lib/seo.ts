import { site } from "./site";
import { fullGraph, jsonLd } from "./schema";

export interface SeoInput {
  title: string;
  description: string;
  /** Path with a leading slash. No trailing slash except the root "/". */
  path: string;
  /** Absolute URL or site-root-relative path. Defaults to the brand OG image. */
  image?: string;
  noindex?: boolean;
  /** Page-specific JSON-LD nodes; site-wide nodes are added automatically. */
  graph?: Array<Record<string, unknown>>;
}

interface HeadScript {
  type: string;
  children: string;
}

export interface HeadOutput {
  meta: Array<Record<string, string>>;
  links: Array<Record<string, string>>;
  scripts?: HeadScript[];
}

const DEFAULT_OG_IMAGE = "/icons/aditeraction-app-icon-1024.png";

function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return site.url + pathOrUrl;
}

/**
 * Builds head() meta + links for a route. Every route must use this so no page
 * ships without a canonical. Title pattern (02-seo-plan.md): inner pages read
 * "{primary} — Aditeraction"; anything already carrying the brand name is left
 * as-is (e.g. the Home title).
 */
export function seo({ title, description, path, image, noindex, graph }: SeoInput): HeadOutput {
  const fullTitle = title.includes(site.name) ? title : `${title} — ${site.name}`;
  // Canonical: site.url + path, no trailing slash except "/".
  const canonical = site.url + path;
  const ogImage = absolute(image ?? DEFAULT_OG_IMAGE);

  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: site.name },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  // One JSON-LD <script> per page: site-wide nodes + this page's nodes. SSR only
  // (TanStack renders head scripts server-side via dangerouslySetInnerHTML).
  const scripts: HeadScript[] | undefined = graph
    ? [{ type: "application/ld+json", children: jsonLd(fullGraph(graph)) }]
    : undefined;

  return {
    meta,
    links: [{ rel: "canonical", href: canonical }],
    ...(scripts ? { scripts } : {}),
  };
}
