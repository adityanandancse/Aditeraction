import { createFileRoute } from "@tanstack/react-router";
import { buildRss } from "~/lib/rss";

// /blog/rss.xml — server route (no component). Built from the posts in
// content/blog on every request; cached for an hour.
export const Route = createFileRoute("/blog/rss.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildRss(), {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
