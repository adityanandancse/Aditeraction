import type { AppPath } from "~/lib/site";
import { visibleNav } from "~/lib/nav";
import { Eyebrow } from "../ui/Eyebrow";
import { BracketLink } from "../ui/BracketLink";

// Ways back from a 404. Work and Blog drop out (via visibleNav) until each has
// something published.
const links = visibleNav<{ label: string; to: AppPath }>([
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
]);

// Branded 404. The <title> and robots <meta> are React 19 hoisted head tags:
// rendered here, they are moved into <head> on the server and the client. The
// root route sets no title of its own, so there is nothing to conflict with on
// an unmatched URL.
export function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-24">
      <title>Page not found — Aditeraction</title>
      <meta name="robots" content="noindex" />
      <Eyebrow>Error · 404</Eyebrow>
      <h1 className="mt-5 text-4xl text-paper sm:text-6xl">Page not found.</h1>
      <p className="mt-5 max-w-xl text-graphite">
        That page isn&apos;t here — it may have moved, or never shipped. Here&apos;s the way back.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        {links.map((l) => (
          <BracketLink key={l.to} to={l.to}>
            {l.label}
          </BracketLink>
        ))}
      </div>
    </section>
  );
}
