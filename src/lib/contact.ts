import { site } from "~/lib/site";

export interface EnquiryParams {
  plan?: string; // plan id (launch | grow | one-roof)
  service?: string; // service slug
}

// Builds a prefilled mailto for the contact page. Pure + deterministic, so it
// renders identically on the server and client (no hydration mismatch). The plan
// id and service slug are resolved to their display names here; anything that
// doesn't match site.ts is treated as absent by the caller's whitelist.
export function buildEnquiryMailto({ plan, service }: EnquiryParams = {}): string {
  const planName = site.plans.find((p) => p.id === plan)?.name;
  const serviceTitle = site.services.find((s) => s.slug === service)?.title;

  const subject =
    "Project enquiry" +
    (planName ? ` — ${planName} plan` : "") +
    (serviceTitle ? ` — ${serviceTitle}` : "");

  // Plain-text body, CRLF line breaks (most mail clients expect \r\n in mailto).
  const body = [
    "Hi Aditya,",
    "",
    "Name:",
    "Company:",
    "Country:",
    `Plan: ${planName ?? "Not sure yet"}`,
    `Services: ${serviceTitle ?? ""}`,
    "",
    "What we're building:",
    "",
    "",
  ].join("\r\n");

  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
