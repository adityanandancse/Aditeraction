import { createFileRoute, notFound } from "@tanstack/react-router";
import { seo } from "~/lib/seo";

// No case-study data exists yet — every slug 404s (no invented content).
// When real case studies are added, this loader resolves them from the source.
export const Route = createFileRoute("/work/$slug")({
  loader: () => {
    throw notFound();
  },
  head: ({ params }) =>
    seo({
      title: "Work",
      description: "Aditeraction case study.",
      path: `/work/${params.slug}`,
      noindex: true,
    }),
  component: () => null,
});
