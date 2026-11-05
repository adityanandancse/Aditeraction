import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { Landing } from "~/components/landing/Landing";
import { IntroLoader } from "~/components/landing/IntroLoader";
import { HomePillars } from "~/components/home/HomePillars";
import { HomeProcess } from "~/components/home/HomeProcess";
import { HomeStats } from "~/components/home/HomeStats";
import { HomeServices } from "~/components/home/HomeServices";
import { HomeStack } from "~/components/home/HomeStack";
import { HomeWork } from "~/components/home/HomeWork";
import { HomeContact } from "~/components/home/HomeContact";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Aditeraction — Design & engineering studio for founders",
      description:
        "A founder-led studio that takes you from idea to launched brand, site and app. Design and code under one roof — India and worldwide. Start a project.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Home-only intro overlay (shown once per session, never no-JS/reduced). */}
      <IntroLoader />

      {/* Scroll-story hero: static SSR fallback + decorative particle canvas.
          The H1 "Idea to launched." is the LCP — never the canvas. */}
      <Landing />

      {/* Phase 4a — home sections after the hero (copy lives in site.ts.home):
          Brand/Site/App pillars → how it works → at a glance. */}
      <HomePillars />
      <HomeProcess />
      <HomeStats />

      {/* Phase 4b — services → stack → selected work → contact CTA. These
          replace the earlier simple "What we do" grid; the footer (section 8)
          lives in the root layout. */}
      <HomeServices />
      <HomeStack />
      <HomeWork />
      <HomeContact />
    </>
  );
}
