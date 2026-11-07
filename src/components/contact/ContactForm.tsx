import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { site } from "~/lib/site";
import { submitEnquiry, type EnquiryResult } from "~/lib/contact-server";

const labelCls = "block font-mono text-xs uppercase tracking-[0.12em] text-graphite";
const inputCls =
  "mt-2 w-full rounded-none border border-line bg-fog px-4 py-3 text-paper placeholder:text-graphite/50 focus-visible:outline-2 focus-visible:outline-vermilion aria-[invalid=true]:border-vermilion";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-vermilion bg-vermilion text-ink hover:bg-[#e8442a] disabled:opacity-60";

const Req = () => (
  <span aria-hidden className="text-vermilion">
    {" *"}
  </span>
);

export function ContactForm({
  token,
  plan,
  service,
}: {
  token: string;
  plan?: string;
  service?: string;
}) {
  const submit = useServerFn(submitEnquiry);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [name, setName] = useState("");

  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the error summary / success heading when the state changes.
  useEffect(() => {
    if (status === "error") errorRef.current?.focus();
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("js", "1");
    fd.set("pageUrl", window.location.href);
    fd.set("referrer", document.referrer);
    setStatus("submitting");
    setFieldErrors({});
    setFormError("");
    try {
      const res = (await submit({ data: fd })) as EnquiryResult;
      if (res.ok) {
        setName(res.name ?? "");
        setStatus("success");
      } else {
        setFieldErrors(res.fieldErrors ?? {});
        setFormError(res.formError ?? "");
        setStatus("error");
      }
    } catch {
      setFormError(`Something went wrong. Email us directly at ${site.contact.email}.`);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="border border-line bg-fog p-8">
        <h2 ref={successRef} tabIndex={-1} className="font-display text-2xl text-paper focus-visible:outline-2 focus-visible:outline-vermilion">
          Thanks, {name || "there"}.
        </h2>
        <p className="mt-3 text-graphite">We reply within 24 hours on working days.</p>
      </div>
    );
  }

  const describedBy = (field: string) => (fieldErrors[field] ? `${field}-error` : undefined);

  return (
    <form method="post" action={submitEnquiry.url} onSubmit={onSubmit} noValidate className="max-w-xl">
      {/* Error summary (focusable) */}
      {status === "error" && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 border border-vermilion bg-fog p-4 text-sm text-paper focus-visible:outline-2 focus-visible:outline-vermilion"
        >
          {formError || "Please check your entries and try again."}
        </p>
      )}

      {/* Honeypot — off-screen, not announced, never tabbed into. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden" style={{ top: "auto" }}>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* Spam time-trap + progressive-enhancement + context (JS fills these). */}
      <input type="hidden" name="t" value={token} />
      <input type="hidden" name="js" value="0" />
      <input type="hidden" name="pageUrl" value="" />
      <input type="hidden" name="referrer" value="" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="cf-name" className={labelCls}>
            Name<Req />
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputCls}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={describedBy("name")}
          />
          {fieldErrors.name && (
            <p id="name-error" className="mt-1.5 text-sm text-vermilion">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="cf-email" className={labelCls}>
            Email<Req />
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={describedBy("email")}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1.5 text-sm text-vermilion">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="cf-company" className={labelCls}>
            Company
          </label>
          <input id="cf-company" name="company" type="text" autoComplete="organization" className={inputCls} />
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="cf-country" className={labelCls}>
            Country
          </label>
          <input id="cf-country" name="country" type="text" autoComplete="country-name" className={inputCls} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cf-plan" className={labelCls}>
            Plan
          </label>
          <select id="cf-plan" name="plan" defaultValue={plan ?? ""} className={inputCls}>
            <option value="">Not sure yet</option>
            {site.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className={labelCls}>Services</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {site.services.map((s) => (
              <label key={s.slug} className="flex items-center gap-2.5 text-sm text-paper/85">
                <input
                  type="checkbox"
                  name="services"
                  value={s.slug}
                  defaultChecked={s.slug === service}
                  className="size-4 accent-vermilion"
                />
                {s.title}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <label htmlFor="cf-message" className={labelCls}>
            What you&apos;re building<Req />
          </label>
          <textarea
            id="cf-message"
            name="message"
            required
            minLength={20}
            maxLength={3000}
            rows={6}
            className={inputCls}
            aria-invalid={!!fieldErrors.message}
            aria-describedby={describedBy("message")}
          />
          {fieldErrors.message && (
            <p id="message-error" className="mt-1.5 text-sm text-vermilion">
              {fieldErrors.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-7">
        <button type="submit" className={primaryBtn} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </button>
        <p className="mt-3 text-xs text-graphite">
          We&apos;ll only use your details to reply to this enquiry.
        </p>
      </div>
    </form>
  );
}
