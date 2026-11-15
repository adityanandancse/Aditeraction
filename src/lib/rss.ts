// RSS 2.0 feed for /blog/rss.xml. Summaries only (title, link, description) —
// readers click through to the post.
import { site } from "./site";
import { getPosts } from "./blog";

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const rfc822 = (iso: string): string => new Date(`${iso}T00:00:00Z`).toUTCString();

export function buildRss(): string {
  const posts = getPosts();
  const newest = posts[0];

  const items = posts
    .map((p) => {
      const url = `${site.url}/blog/${p.slug}`;
      const categories = p.tags.map((t) => `\n      <category>${escapeXml(t)}</category>`).join("");
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <description>${escapeXml(p.description)}</description>${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} Blog`)}</title>
    <link>${site.url}/blog</link>
    <atom:link href="${site.url}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(blogDescription)}</description>
    <language>en</language>${newest ? `\n    <lastBuildDate>${rfc822(newest.date)}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;
}

/** One-line description of the blog, shared by the page meta and the feed. */
export const blogDescription =
  "Notes from Aditeraction on building brands, websites and apps: what works, what it costs, and how to launch.";

/** <link rel="alternate"> that lets feed readers discover the feed from a page. */
export const rssLink = {
  rel: "alternate",
  type: "application/rss+xml",
  title: `${site.name} Blog`,
  href: "/blog/rss.xml",
};
