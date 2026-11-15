import type { MouseEvent } from "react";
import { createFileRoute, notFound, Link, useRouter } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { getPost, getPosts, loadPostHtml, formatDate } from "~/lib/blog";
import { rssLink } from "~/lib/rss";
import { blogPostGraph } from "~/lib/schema";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { HomeContact } from "~/components/home/HomeContact";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = getPost(params.slug);
    const html = post ? await loadPostHtml(post.slug) : undefined;
    if (!post || html === undefined) throw notFound();
    return { post, html };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return seo({ title: "Blog", description: "Blog post.", path: "/blog" });
    const { post } = loaderData;
    const base = seo({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      image: post.image ?? "/og/blog.png",
      imageAlt: post.imageAlt ?? post.title,
      noindex: post.draft, // drafts only exist in dev; belt and braces
      article: { published: post.date, modified: post.updated, tags: post.tags },
      graph: blogPostGraph(post),
    });
    return { ...base, links: [...base.links, rssLink] };
  },
  component: BlogPost,
});

const navLink =
  "font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:text-vermilion";

function BlogPost() {
  const { post, html } = Route.useLoaderData();
  const router = useRouter();

  // Posts are listed newest first, so the "next" (newer) post sits before this one.
  const all = getPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? all[idx - 1] : undefined;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;

  // The body is plain HTML, so links to our own pages are ordinary <a> tags.
  // Route them through the router to keep navigation client-side. Files
  // (/media/x.pdf), in-page #anchors and external links are left to the browser.
  function onBodyClick(e: MouseEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const anchor = (e.target as HTMLElement).closest("a");
    const href = anchor?.getAttribute("href");
    if (!anchor || !href || anchor.target === "_blank") return;
    if (!href.startsWith("/") || href.startsWith("//") || /\.[a-z0-9]+$/i.test(href)) return;
    e.preventDefault();
    void router.navigate({ href });
  }

  return (
    <>
      <article aria-labelledby="post-h1">
        <header className="mx-auto max-w-6xl px-6 pt-16 pb-10">
          <Breadcrumbs
            items={[{ label: "Home", to: "/" }, { label: "Blog", to: "/blog" }, { label: post.title }]}
          />
          <Eyebrow className="mt-8">{post.draft ? "Draft · not published" : "Blog"}</Eyebrow>
          <h1 id="post-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/90">{post.description}</p>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
            By{" "}
            <Link to="/about" className="text-paper transition-colors hover:text-vermilion">
              {site.founder.name}
            </Link>
            {" · "}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.updated && post.updated !== post.date && (
              <>
                {" · Updated "}
                <time dateTime={post.updated}>{formatDate(post.updated)}</time>
              </>
            )}
            {` · ${post.minutes} min read`}
          </p>
        </header>

        <div className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div
              className="post-body max-w-2xl"
              onClick={onBodyClick}
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {post.tags.length > 0 && (
              <ul aria-label="Tags" className="mt-12 flex max-w-2xl list-none flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/85"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </article>

      <nav aria-label="More posts" className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-12">
          {older ? (
            <Link to="/blog/$slug" params={{ slug: older.slug }} className={navLink}>
              <span aria-hidden>← </span>
              {older.title}
            </Link>
          ) : (
            <Link to="/blog" className={navLink}>
              <span aria-hidden>← </span>
              All posts
            </Link>
          )}
          {newer && (
            <Link to="/blog/$slug" params={{ slug: newer.slug }} className={`${navLink} text-right`}>
              {newer.title}
              <span aria-hidden> →</span>
            </Link>
          )}
        </div>
      </nav>

      <HomeContact />
    </>
  );
}
