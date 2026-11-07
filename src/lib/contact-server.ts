import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { site } from "~/lib/site";
import { buildConfirmationEmail } from "~/lib/emails/confirmation";

// Result returned to the JS client. The no-JS path throws a redirect instead, so
// the plain-HTML POST lands back on /contact with a ?sent / ?error banner.
export interface EnquiryResult {
  ok: boolean;
  name?: string;
  formError?: string;
  fieldErrors?: Record<string, string>;
}

const PLAN_IDS: string[] = site.plans.map((p) => p.id);
const SERVICE_SLUGS: string[] = site.services.map((s) => s.slug);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FILL_MS = 3000; // time-trap: a human can't complete the form faster

const cap = (s: string, n: number) => s.trim().slice(0, n);
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const planLabel = (id: string) => site.plans.find((p) => p.id === id)?.name ?? "Not sure yet";
const serviceTitle = (slug: string) => site.services.find((s) => s.slug === slug)?.title ?? slug;

// Enquiry submission. POST server function — the handler is stripped from the
// client bundle by the TanStack Start plugin, so RESEND_API_KEY (read via the
// server-only `cloudflare:workers` env inside the handler) never reaches the
// browser. Called two ways:
//   • JS:    submitEnquiry({ data: formData })  → returns EnquiryResult (inline UI)
//   • no-JS: <form method="post" action={submitEnquiry.url}> → throws redirect
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }): Promise<EnquiryResult> => {
    const fd = data;
    const field = (k: string) => (fd.get(k) ?? "").toString();
    const js = field("js") === "1";

    const done = (result: EnquiryResult, search: Record<string, string | boolean>): EnquiryResult => {
      if (js) return result;
      throw redirect({ to: "/contact", search });
    };

    // --- spam traps: bots get a fake success; nothing is sent ----------------
    const honeypot = field("website").trim();
    const token = Number(safeAtob(field("t")));
    const elapsed = Number.isFinite(token) ? Date.now() - token : Infinity;
    const trapped = honeypot.length > 0 || (elapsed >= 0 && elapsed < MIN_FILL_MS);
    if (trapped) {
      return done({ ok: true, name: cap(field("name"), 100) || "there" }, { sent: true });
    }

    // --- validate + normalise ------------------------------------------------
    const name = cap(field("name"), 100);
    const email = cap(field("email"), 200);
    const company = cap(field("company"), 100);
    const country = cap(field("country"), 100);
    const message = cap(field("message"), 3000);
    const planId = PLAN_IDS.includes(field("plan")) ? field("plan") : "";
    const services = fd
      .getAll("services")
      .map((s) => s.toString())
      .filter((s) => SERVICE_SLUGS.includes(s));

    const fieldErrors: Record<string, string> = {};
    if (!name) fieldErrors.name = "Please tell us your name.";
    if (!email) fieldErrors.email = "Please add an email so we can reply.";
    else if (!EMAIL_RE.test(email)) fieldErrors.email = "That email doesn't look right.";
    if (message.length < 20) fieldErrors.message = "Please add a little more detail (at least 20 characters).";

    if (Object.keys(fieldErrors).length > 0) {
      return done(
        { ok: false, fieldErrors, formError: "Please fix the highlighted fields and try again." },
        { error: "validation" },
      );
    }

    // --- read the server-only API key (never bundled for the client) ---------
    let apiKey: string | undefined;
    try {
      const { env } = (await import("cloudflare:workers")) as { env: Record<string, string | undefined> };
      apiKey = env.RESEND_API_KEY;
    } catch {
      /* not running on the Worker runtime */
    }
    const friendlyError = `Something went wrong. Email us directly at ${site.contact.email}.`;
    if (!apiKey) {
      console.warn(
        "[contact] RESEND_API_KEY is not set — add it to .dev.vars (local) or `wrangler secret put RESEND_API_KEY` (prod). Enquiry was NOT sent.",
      );
      return done({ ok: false, formError: friendlyError }, { error: "send" });
    }

    // --- build the email -----------------------------------------------------
    let referer = "";
    try {
      const { getRequestHeaders } = await import("@tanstack/react-start/server");
      referer = getRequestHeaders().get?.("referer") ?? "";
    } catch {
      /* headers unavailable */
    }
    const pageUrl = cap(field("pageUrl"), 500) || referer;
    const referrer = cap(field("referrer"), 500) || referer;

    const now = new Date();
    const utc = now.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
    const ist = new Date(now.getTime() + 5.5 * 3600 * 1000)
      .toISOString()
      .replace("T", " ")
      .replace(/\.\d+Z$/, " IST (UTC+5:30)");

    const rows: Array<[string, string]> = [
      ["Name", name],
      ["Email", email],
      ["Company", company || "—"],
      ["Country", country || "—"],
      ["Plan", planId ? planLabel(planId) : "Not sure yet"],
      ["Services", services.length ? services.map(serviceTitle).join(", ") : "—"],
      ["Message", message],
      ["Page URL", pageUrl || "—"],
      ["Referrer", referrer || "—"],
      ["Submitted", utc],
      ["Submitted (IST)", ist],
    ];
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
    const html = `<h2>New enquiry</h2><table cellpadding="6" style="border-collapse:collapse">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="vertical-align:top;color:#8A8A94;font-family:monospace">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`,
      )
      .join("")}</table>`;

    const subject = `New enquiry — ${name}${company ? ` · ${company}` : ""} (${planId ? planLabel(planId) : "Not sure yet"})`;

    // --- send via Resend -----------------------------------------------------
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: site.contact.formFrom,
          to: site.contact.formTo,
          reply_to: email,
          subject,
          text,
          html,
        }),
      });
      if (!res.ok) {
        const reqId = res.headers.get("x-request-id") ?? res.headers.get("x-resend-request-id") ?? "none";
        console.error(`[contact] Resend send failed — status ${res.status}, request id ${reqId}`);
        return done({ ok: false, formError: friendlyError }, { error: "send" });
      }
    } catch (e) {
      console.error(`[contact] Resend request threw: ${e instanceof Error ? e.name : "error"}`);
      return done({ ok: false, formError: friendlyError }, { error: "send" });
    }

    // --- confirmation to the submitter ---------------------------------------
    // Only reached once the internal email to info@ returned 2xx. A failure here
    // must NOT change the user's success — their enquiry already reached us.
    // Fixed template: only the first name + whitelisted plan/service titles. The
    // message, company and country are never passed in.
    try {
      const confirmation = buildConfirmationEmail({
        firstName: firstNameOf(name),
        plan: planId ? planLabel(planId) : undefined,
        services: services.map(serviceTitle),
      });
      const cRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: site.contact.confirmFrom,
          to: email,
          reply_to: site.contact.email,
          subject: confirmation.subject,
          text: confirmation.text,
          html: confirmation.html,
        }),
      });
      if (!cRes.ok) {
        const reqId = cRes.headers.get("x-request-id") ?? cRes.headers.get("x-resend-request-id") ?? "none";
        console.error(`[contact] confirmation email failed — status ${cRes.status}, request id ${reqId}`);
      }
    } catch (e) {
      console.error(`[contact] confirmation email threw: ${e instanceof Error ? e.name : "error"}`);
    }

    return done({ ok: true, name }, { sent: true });
  });

// First name for the confirmation greeting: first word only, URLs and @ < >
// stripped, capped at 40 chars; "there" when nothing usable remains.
function firstNameOf(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const cleaned = first
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[@<>]/g, "")
    .trim()
    .slice(0, 40);
  return cleaned || "there";
}

// atob that never throws (returns "" on bad input). Available on the Worker.
function safeAtob(s: string): string {
  try {
    return typeof atob === "function" ? atob(s) : "";
  } catch {
    return "";
  }
}
