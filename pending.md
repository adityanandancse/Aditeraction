# Pending — needed from AB
Updated whenever a task adds or resolves something only AB can do. Check off items, don't delete them until the phase closes.

## Phase 8 — Case studies (skipped for now)
- [ ] First real case study facts for site.ts (slug, title, industry, region, services, summary; plus client, year, challenge, approach, outcome, deliverables, stack, verified metrics, real quote, url — only what's true)
- [ ] Real projects to replace Home "Selected work" placeholders
- [ ] Real numbers for World reach stats (hidden until provided)

## Phase 9 — Perf + audits
- [x] Run A2 measurement: build → preview:prod → Lighthouse Mobile, incognito, 3 runs on http://localhost:4174; share median Perf / FCP / LCP / TBT / CLS
- [ ] Share seo-audit, geo-audit, geo-citability results when run
- [ ] Optional: after first deploy, run Lighthouse against the live/workers.dev URL — local preview serves assets slowly (~1.5s each), which inflates simulated FCP/TTI

## Before launch
- [x] Decide on a privacy page (UK/EU visitors; outside the 12 locked URLs)
- [ ] Review /privacy wording and confirm retention period
- [ ] /privacy does not name the mailbox provider behind info@ (not in the code): say if it should be listed as a processor
- [ ] Turn on Work nav + home section: just set published: true on the first case study
- [ ] Set production secret: bunx wrangler secret put RESEND_API_KEY
- [ ] Send a test enquiry from the live form and confirm both emails arrive

## Launch (AB deploys)
- [ ] Deploy to Cloudflare Workers + confirm custom domain
- [ ] Route www.aditeraction.com to the Worker too (custom domain or route + DNS), otherwise the www→apex redirect in src/server.ts never runs
- [ ] Submit sitemap.xml in Google Search Console and Bing Webmaster Tools
- [ ] Check OG previews in LinkedIn Post Inspector

## After indexing
- [ ] Run aeo-audit
- [ ] Optional: enable Cloudflare Turnstile if form spam appears
