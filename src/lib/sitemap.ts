// sitemap.xml builder (Phase 7b). Pure function — no React, no DOM — so the
// /sitemap.xml server route and scripts can share it and it stays in sync with
// site.ts. Rules: single source = site.ts; absolute URLs from site.url; never
// list a URL that is noindex or 404.
//
// Included: / , /services, the 6 /services/{slug}, /about, /contact, /privacy. /work and
// every /work/{slug} are OMITTED while /work is noindex and all case studies are
// unpublished (getPublishedWork() is empty); published studies re-add themselves
// automatically via the loop below. <lastmod> comes from site.pagesUpdated (never
// build time) and is omitted for any path not in that map. No changefreq/priority.
// /blog and every post are added once a post exists; a post's <lastmod> is its
// `updated` (or `date`) frontmatter, and /blog takes the newest of those.
import { site, getPublishedWork } from "./site";
import { getPosts } from "./blog";

/** Absolute URL for a route path. Home keeps its single trailing slash. */
function loc(path: string): string {
  return path === "/" ? `${site.url}/` : `${site.url}${path}`;
}

/** XML text escaping for <loc> values (& is the one that actually occurs). */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Ordered list of indexable paths, derived entirely from site.ts. */
export function sitemapPaths(): string[] {
  const paths: string[] = [
    "/",
    "/services",
    ...site.services.map((s) => `/services/${s.slug}`),
    "/about",
    "/contact",
    "/privacy",
  ];

  // /work is noindex until a case study is published; include it and the
  // published studies only once getPublishedWork() returns entries.
  const published = getPublishedWork();
  if (published.length > 0) {
    paths.push("/work", ...published.map((w) => `/work/${w.slug}`));
  }

  const posts = getPosts();
  if (posts.length > 0) {
    paths.push("/blog", ...posts.map((p) => `/blog/${p.slug}`));
  }

  return paths;
}

/** Full <urlset> document as a string, ready to serve as application/xml. */
export function buildSitemap(): string {
  const lastmod: Record<string, string> = { ...site.pagesUpdated };
  const posts = getPosts();
  for (const p of posts) lastmod[`/blog/${p.slug}`] = p.updated ?? p.date;
  if (posts.length > 0) {
    lastmod["/blog"] = posts.map((p) => p.updated ?? p.date).sort().at(-1) as string;
  }

  const urls = sitemapPaths()
    .map((path) => {
      const when = lastmod[path];
      const lastmodLine = when ? `\n    <lastmod>${when}</lastmod>` : "";
      return `  <url>\n    <loc>${escapeXml(loc(path))}</loc>${lastmodLine}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
