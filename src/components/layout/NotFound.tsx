import { Eyebrow } from "../ui/Eyebrow";
import { BracketLink } from "../ui/BracketLink";

// Branded 404 — links to Home, Services, Work, Contact.
export function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-24">
      <Eyebrow>Error · 404</Eyebrow>
      <h1 className="mt-5 text-4xl text-paper sm:text-6xl">Page not found.</h1>
      <p className="mt-5 max-w-xl text-graphite">
        That page isn&apos;t here — it may have moved, or never shipped. Here&apos;s the way back.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <BracketLink to="/">Home</BracketLink>
        <BracketLink to="/services">Services</BracketLink>
        <BracketLink to="/work">Work</BracketLink>
        <BracketLink to="/contact">Contact</BracketLink>
      </div>
    </section>
  );
}
