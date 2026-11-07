// llms.txt + llms-full.txt builders (Phase 7b). Pure functions — no React, no
// DOM — shared by the /llms.txt and /llms-full.txt server routes so the output
// stays in sync with site.ts. Format: llmstxt.org (Markdown). Facts only; every
// string is sourced from site.ts, nothing invented (no numbers, clients, dates).
import { site } from "./site";

const abs = (path: string): string => `${site.url}${path}`;

/** Look up a "How we work" body by its label (payment, revisions, etc.). */
function howWeWork(label: string): string {
  return site.howWeWork.find((h) => h.label === label)?.body ?? "";
}

/** Client regions as plain prose, derived from the world-reach data. */
function regionsText(): string {
  const overseas = site.home.reach.regions
    .filter((r) => !("local" in r && r.local))
    .map((r) => r.label);
  return ["India", ...overseas.slice(0, -1)].join(", ") + ` and ${overseas[overseas.length - 1]}`;
}

/** Delivered-for industries as prose ("fashion, textiles, D2C, …"). */
function industriesText(): string {
  const ind = site.industries.map((x) => (x === "D2C" ? x : x.toLowerCase()));
  return `${ind.slice(0, -1).join(", ")} and ${ind[ind.length - 1]}`;
}

/** Shared H1 + blockquote + one-paragraph intro used by both files. */
function header(): string {
  const intro =
    `${site.name} was founded by ${site.founder.name} and is based in ${site.founder.location}. ` +
    `The studio works with founders and businesses across ${regionsText()}, ` +
    `and has delivered for ${industriesText()}.`;
  return `# ${site.name}\n\n> ${site.answers.whatWeDo.answer}\n\n${intro}`;
}

/** Concise llms.txt index. */
export function buildLlmsTxt(): string {
  const services = site.services
    .map((s) => `- [${s.title}](${abs(`/services/${s.slug}`)}): ${s.summary}`)
    .join("\n");

  const planLines = site.plans
    .map((p) => `- ${p.name} — ${p.label} (${p.timeline}): ${p.forWho}`)
    .join("\n");

  const plansIntro = [
    site.plansNote,
    howWeWork("Payment"),
    site.plansRevisions,
    howWeWork("Ownership"),
    howWeWork("Support"),
  ].join(" ");

  const careLine = `- ${site.plansAddon.name}: ${site.plansAddon.body}`;

  const company = [
    `- [About](${abs("/about")}): ${site.founder.bio}`,
    `- [Contact](${abs("/contact")}): Email ${site.email}. ${howWeWork("Communication")}`,
  ].join("\n");

  return `${header()}

## Services

${services}

## Plans

${plansIntro}

${planLines}
${careLine}

## Company

${company}

## Optional

- [Full FAQ](${abs("/llms-full.txt")}): Every question and answer, site-wide and per service.
`;
}

/** Render a list of FAQs as "### Question" + answer blocks. */
function faqBlocks(faqs: readonly { q: string; a: string }[]): string {
  return faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");
}

/** Extended llms-full.txt: header + every FAQ, grouped by page. */
export function buildLlmsFullTxt(): string {
  const general = `## General\n\n${faqBlocks(site.faqs)}`;

  const perService = site.services
    .filter((s) => s.faqs.length > 0)
    .map((s) => `## ${s.title}\n\n${faqBlocks(s.faqs)}`)
    .join("\n\n");

  return `${header()}

${general}

${perService}
`;
}
