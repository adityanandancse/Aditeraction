import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { site } from "~/lib/site";
import { privacyGraph } from "~/lib/schema";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Eyebrow } from "~/components/ui/Eyebrow";

// Written from what the code does (src/lib/contact-server.ts, ContactForm.tsx,
// __root.tsx). If the form fields, processors or storage change, update this
// page, LAST_UPDATED and site.pagesUpdated["/privacy"] together.
const LAST_UPDATED = "12 November 2026";

// Meta description (≤155).
const privacyDescription =
  "What Aditeraction collects when you send an enquiry, why, who processes it, how long we keep it, and how to ask for access or deletion.";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: "Privacy Policy",
      description: privacyDescription,
      path: "/privacy",
      graph: privacyGraph(),
    }),
  component: Privacy,
});

const mailLink = "text-paper underline underline-offset-2 transition-colors hover:text-vermilion";

function Email() {
  return (
    <a href={`mailto:${site.email}`} className={mailLink}>
      {site.email}
    </a>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-10 first:border-t-0 first:pt-0">
      <h2 id={id} className="font-display text-2xl text-paper sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-relaxed text-graphite">{children}</div>
    </section>
  );
}

const list = "flex list-disc flex-col gap-2 pl-5 marker:text-vermilion";

function Privacy() {
  return (
    <>
      <section aria-labelledby="privacy-h1" className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy Policy" }]} />
        <Eyebrow className="mt-8">Legal</Eyebrow>
        <h1 id="privacy-h1" className="mt-5 max-w-3xl text-4xl text-paper sm:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-8 max-w-2xl leading-relaxed text-graphite">
          The short version: we only hold what you choose to send us, we use it to reply and to
          scope your project, and we don&apos;t track you around this site.
        </p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-graphite">
          Last updated: {LAST_UPDATED}
        </p>
      </section>

      <div className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Block id="privacy-who" title="Who we are">
            <p>
              {site.name} is a founder-led design and engineering studio based in{" "}
              {site.founder.location}. We decide how the information described on this page is
              used. For anything about your data, email <Email />.
            </p>
          </Block>

          <Block id="privacy-what" title="What we collect">
            <p>
              When you send the enquiry form on our <Link to="/contact" className={mailLink}>contact page</Link>,
              we receive:
            </p>
            <ul className={list}>
              <li>Your name and email address (required).</li>
              <li>Your company and country, if you fill them in.</li>
              <li>The plan and services you select, if any.</li>
              <li>Your message about what you&apos;re building.</li>
              <li>
                The address of the page you sent the form from, the page that referred you to it
                (if your browser shares one), and the time you sent it.
              </li>
            </ul>
            <p>
              If you email us directly instead, we receive your email address and whatever you
              choose to write.
            </p>
            <p>We don&apos;t ask for payment details, ID documents or passwords through this site.</p>
          </Block>

          <Block id="privacy-why" title="Why we collect it">
            <p>
              To reply to your enquiry, and to scope and quote the project you&apos;re asking
              about. That&apos;s all. We don&apos;t add you to a mailing list, and we don&apos;t
              sell or share your details for marketing.
            </p>
            <p>
              After you send the form, you get one automatic confirmation email at the address you
              gave, so you know the enquiry reached us.
            </p>
          </Block>

          <Block id="privacy-processors" title="Who processes it for us">
            <ul className={list}>
              <li>
                <span className="text-paper">Resend</span> sends the form emails: the enquiry to
                our inbox and the confirmation to you.
              </li>
              <li>
                <span className="text-paper">Cloudflare</span> hosts this site and keeps request
                logs, as any web host does.
              </li>
            </ul>
            <p>Your enquiry then sits in our email inbox, where we read and answer it.</p>
          </Block>

          <Block id="privacy-tracking" title="Analytics, ads and cookies">
            <p>
              This site runs no analytics, no advertising and no tracking cookies.
            </p>
            <p>
              One small thing is stored in your browser: a session-storage flag that remembers
              you&apos;ve already seen the intro animation, so it plays once per visit. It holds
              no personal information, it never leaves your browser, and it&apos;s cleared when
              you close the tab.
            </p>
          </Block>

          <Block id="privacy-retention" title="How long we keep it">
            <p>
              We keep your enquiry while we&apos;re handling it and through any project that
              follows. After that we delete it when you ask us to, or once we no longer need it.
            </p>
          </Block>

          <Block id="privacy-rights" title="Your rights">
            <p>
              Under the UK and EU GDPR and India&apos;s Digital Personal Data Protection Act 2023,
              you can ask us to:
            </p>
            <ul className={list}>
              <li>Show you the information we hold about you.</li>
              <li>Correct anything that&apos;s wrong.</li>
              <li>Delete it.</li>
              <li>Stop using it, if you object to how we use it.</li>
            </ul>
            <p>
              Email <Email /> and we&apos;ll sort it out.
            </p>
          </Block>

          <Block id="privacy-transfers" title="International transfers">
            <p>
              We&apos;re based in India and work with clients worldwide. The companies that
              process data for us may handle it in countries other than yours.
            </p>
          </Block>

          <Block id="privacy-changes" title="Changes to this page">
            <p>
              If what we collect or how we use it changes, we&apos;ll update this page and the
              date at the top.
            </p>
          </Block>
        </div>
      </div>
    </>
  );
}
