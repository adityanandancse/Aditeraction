// Submitter confirmation email (fixed template). Pure — returns { subject, text,
// html } from a tiny, already-sanitised input. It NEVER receives or renders the
// enquiry message, company, country or any other free text: only the first name
// plus whitelisted plan/service titles. All dynamic values are HTML-escaped in
// the HTML version.

export interface ConfirmationInput {
  firstName: string; // already sanitised (first word, no URLs/@/<>, ≤40, or "there")
  plan?: string; // whitelisted plan title, or undefined
  services?: readonly string[]; // whitelisted service titles
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

const escHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildConfirmationEmail({ firstName, plan, services }: ConfirmationInput): RenderedEmail {
  const hasServices = !!services && services.length > 0;
  const planPhrase = plan ? ` about the ${plan} plan` : "";
  const servicesPhrase = hasServices ? ` for ${services!.join(", ")}` : "";

  const subject = "We've got your enquiry — Aditeraction";

  const text = `Hi ${firstName},

Thanks for getting in touch with Aditeraction. We've received your enquiry${planPhrase}${servicesPhrase}.

What happens next:
1. We review what you're building.
2. We reply within 24 hours on working days, usually to set up a short call in your time zone.
3. We scope the work and send you a quote.

Want to add anything? Just reply to this email.

Aditya
Founder, Aditeraction
aditeraction.com · info@aditeraction.com`;

  // HTML: table-based, inline styles only, no images/external CSS/tracking.
  const eFirst = escHtml(firstName);
  const ePlan = plan ? ` about the ${escHtml(plan)} plan` : "";
  const eServices = hasServices ? ` for ${services!.map(escHtml).join(", ")}` : "";
  const font = "Arial, Helvetica, sans-serif";

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#F4F1EC">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F1EC;margin:0;padding:24px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#F4F1EC;color:#0B0B0D;font-family:${font};font-size:16px;line-height:1.6">
<tr><td style="padding:8px 4px">
<p style="margin:0 0 12px;font-size:18px;color:#0B0B0D">Hi ${eFirst},</p>
<div style="height:2px;width:48px;background:#FF4D2E;margin:0 0 20px;font-size:0;line-height:0">&nbsp;</div>
<p style="margin:0 0 16px;color:#0B0B0D">Thanks for getting in touch with Aditeraction. We&rsquo;ve received your enquiry${ePlan}${eServices}.</p>
<p style="margin:0 0 8px;color:#0B0B0D;font-weight:bold">What happens next:</p>
<ol style="margin:0 0 16px;padding-left:22px;color:#0B0B0D">
<li style="margin:0 0 6px">We review what you&rsquo;re building.</li>
<li style="margin:0 0 6px">We reply within 24 hours on working days, usually to set up a short call in your time zone.</li>
<li style="margin:0 0 6px">We scope the work and send you a quote.</li>
</ol>
<p style="margin:0 0 20px;color:#0B0B0D">Want to add anything? Just reply to this email.</p>
<p style="margin:0;color:#0B0B0D">Aditya<br>Founder, Aditeraction<br>aditeraction.com &middot; info@aditeraction.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}
