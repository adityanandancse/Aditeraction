// Blog data. Posts are Markdown files in content/blog/ — one file per post, the
// file name is the URL slug. scripts/blog-plugin.ts compiles them at build time
// into the two module kinds globbed below. To publish: add a .md file, deploy.
//
// This module uses import.meta.glob, so it only works inside Vite (app code).
// Don't import it from site.ts or schema.ts — bun scripts import those directly.

export interface PostMeta {
  slug: string;
  title: string;
  /** Meta description and listing summary (aim for ≤155 characters). */
  description: string;
  /** Publish date, YYYY-MM-DD. */
  date: string;
  /** Last meaningful edit, YYYY-MM-DD. */
  updated?: string;
  tags: string[];
  /** Social card: site-root-relative path or absolute URL. Defaults to the blog card. */
  image?: string;
  imageAlt?: string;
  /** Estimated reading time. */
  minutes: number;
  /** Drafts show in `vite dev` only; they are stripped from production builds. */
  draft: boolean;
}

const metaModules = import.meta.glob<PostMeta | null>("/content/blog/*.md", {
  query: "?meta",
  import: "default",
  eager: true,
});

const htmlLoaders = import.meta.glob<string | null>("/content/blog/*.md", {
  query: "?html",
  import: "default",
});

// Newest first; same-day posts fall back to slug so the order is stable.
const posts: readonly PostMeta[] = Object.values(metaModules)
  .filter((m): m is PostMeta => m !== null)
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

/** Every visible post, newest first. */
export function getPosts(): readonly PostMeta[] {
  return posts;
}

export function getPost(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

/** Rendered HTML body for a post (its own lazy chunk). */
export async function loadPostHtml(slug: string): Promise<string | undefined> {
  const load = htmlLoaders[`/content/blog/${slug}.md`];
  return (load && (await load())) ?? undefined;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC", // dates are calendar days; never shift them by viewer time zone
});

/** "2026-11-15" → "15 November 2026". */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}
