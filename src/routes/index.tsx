import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/lib/seo";
import { homeGraph } from "~/lib/schema";
import { Landing } from "~/components/landing/Landing";
import { IntroLoader } from "~/components/landing/IntroLoader";
import { HomePillars } from "~/components/home/HomePillars";
import { HomeProcess } from "~/components/home/HomeProcess";
import { HomeReach } from "~/components/home/HomeReach";
import { HomeServices } from "~/components/home/HomeServices";
import { HomePlans } from "~/components/home/HomePlans";
import { HomeWhy } from "~/components/home/HomeWhy";
import { HomeStack } from "~/components/home/HomeStack";
import { HomeWork } from "~/components/home/HomeWork";
import { HomeFaq } from "~/components/home/HomeFaq";
import { HomeContact } from "~/components/home/HomeContact";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Aditeraction — Design & engineering studio for founders",
      description:
        "A founder-led studio that takes you from idea to launched brand, site and app. Design and code under one roof — India and worldwide. Start a project.",
      path: "/",
      graph: homeGraph(),
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
          Brand/Site/App pillars → how it works → world reach. The old "At a
          glance" stats section (HomeStats) is hidden until real figures exist
          (Phase 5c); HomeReach now fills this slot. */}
      <HomePillars />
      <HomeProcess />
      <HomeReach />

      {/* Phase 4b/4c — services → plans → why → stack → selected work → contact.
          These replace the earlier simple "What we do" grid; the footer
          (section 8) lives in the root layout. */}
      <HomeServices />
      <HomePlans />
      <HomeWhy />
      <HomeStack />
      <HomeWork />
      <HomeFaq />
      <HomeContact />
    </>
  );
}
