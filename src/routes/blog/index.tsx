import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { getPosts, formatDate } from "~/lib/blog";
import { blogDescription, rssLink } from "~/lib/rss";
import { blogHubGraph } from "~/lib/schema";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";
import { HomeContact } from "~/components/home/HomeContact";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const posts = getPosts();
    const base = seo({
      title: "Blog — Brand, Web & App Notes | Aditeraction",
      description: blogDescription,
      path: "/blog",
      image: "/og/blog.png",
      imageAlt: "Blog",
      graph: blogHubGraph(posts),
    });
    const links = [...base.links, rssLink];
    // Thin page while nothing is published: keep it out of the index (same rule
    // as /work). This branch disappears with the first post.
    return posts.length === 0
      ? { ...base, links, meta: [...base.meta, { name: "robots", content: "noindex, follow" }] }
      : { ...base, links };
  },
  component: BlogHub,
});

function BlogHub() {
  const posts = getPosts();

  return (
    <>
      <section aria-labelledby="blog-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Blog" }]} />
        <Eyebrow className="mt-8">Notes from the studio</Eyebrow>
        <h1 id="blog-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
          Blog
        </h1>
        <p className="mt-6 max-w-2xl text-graphite">{blogDescription}</p>

        {posts.length > 0 ? (
          <ol className="mt-12 list-none border-t border-line">
            {posts.map((post) => (
              <Reveal as="li" key={post.slug} className="border-b border-line">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group grid gap-3 py-8 sm:grid-cols-[11rem_1fr] sm:gap-8"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-graphite sm:pt-1.5">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </span>
                  <span className="flex max-w-2xl flex-col">
                    <span className="font-display text-2xl tracking-[-0.03em] text-paper transition-colors group-hover:text-vermilion">
                      {post.title}
                    </span>
                    <span className="mt-2 leading-relaxed text-graphite">{post.description}</span>
                    <span className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite">
                      {[`${post.minutes} min read`, ...post.tags, ...(post.draft ? ["Draft"] : [])].join(" · ")}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        ) : (
          <div className="mt-12 border border-line bg-fog p-8">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">In preparation</p>
            <p className="mt-3 max-w-xl text-paper/85">The first posts are being written.</p>
          </div>
        )}
      </section>

      <HomeContact />
    </>
  );
}
