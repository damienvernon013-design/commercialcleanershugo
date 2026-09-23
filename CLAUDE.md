# commercialcleanershugo.com

Static HTML microsite for Hugo Commercial Cleaners (Hugo, MN), part of the QM
microsite portfolio (`thequotemasters.com` CRM backend). No build step, no
framework — plain HTML/CSS/JS deployed to Vercel.

## Structure

- 43 core static pages under trailing-slash paths (`about/index.html`, `service-areas/<town>/index.html`, etc.) plus `blog/` (25 posts + hub, 26 pages) — 69 pages total
- `styles.css` — single global stylesheet, includes the `.wiz-*` quote-wizard block and `.blog-*` blog block
- `utm-capture.js` — loaded on every page, captures `utm_*` query params into `sessionStorage`
- `assets/js/quote-wizard.js` — multi-step CRM quote wizard, loaded only on `/request-a-quote/`; question set, answer IDs, and appointment slots come from the CRM's fixed `get_lead_faq` schema and are portfolio-wide, not site-specific
- Home (`index.html`) and `/contact/` use short teaser forms (`data-lead-teaser`, name+phone+sqft, GET to `/request-a-quote/`) that prefill the wizard via query params — no JS needed on those pages
- `api/submit-lead.js` — Vercel serverless function; validates and proxies wizard submissions to the CRM (`thequotemasters.com/crm_api`), holding the Bearer token server-side
- `vercel.json` — security headers (HSTS, X-Frame-Options, etc.)

## CRM integration

Forms never talk to the CRM directly — the Bearer token must not reach the
browser. `api/submit-lead.js` reads `CRM_API_TOKEN` from a Vercel environment
variable and forwards to `POST https://thequotemasters.com/crm_api/api.php?action=push_lead`.

`industry` is visitor-selected from the wizard's facility-type dropdown (40+
CRM industry codes) rather than hardcoded. `questions[]` and `appointments[]`
are populated from the wizard's own questionnaire and walkthrough-booking
steps.

**`CRM_API_TOKEN` is shared across every site in the ~60-site QM portfolio.**
Since the CRM has no per-site field, `SITE_SOURCE_TAG` (`'Site:
commercialcleanershugo.com'`) is prepended into `customer.notes` on every
submission in `api/submit-lead.js` — without it, this site's leads are
indistinguishable from every other portfolio site's leads in the CRM. If this
file is ever copied to another site, that constant (and the CORS origin,
`ZIP_DEFAULT`, `ADDRESS_DEFAULT`) must be updated first.

Set `CRM_API_TOKEN` in the Vercel project's Environment Variables (Production
+ Preview). Never commit it — see `.env.example` for the expected key name.

## Blog

`blog/<slug>/index.html` × 25 + `blog/index.html` hub, built from the
portfolio's generic commercial-cleaning content pack, rewritten for Hugo
Commercial Cleaners branding. Facility scope matches this site's actual
service scope (office, retail, medical/dental, warehouse) — posts about
verticals this site doesn't quote (restaurants, gyms, schools/daycares) were
reframed as general facility-hygiene guidance rather than direct service
claims. JSON-LD is `LocalBusiness` only, matching every other page on this
site — no `Article`/`BlogPosting` schema, byline, or publish date. "Blog" is
linked in the nav and footer on all 43 core pages plus `sitemap.xml`.

## Conventions

- All pages use absolute paths (`/styles.css`, `/utm-capture.js`) so nesting depth doesn't matter.
- JSON-LD `url` must match the page's canonical/OG URL on `commercialcleanershugo.com` — a prior domain-mismatch bug (`hugo-commercial-cleaners.com` in JSON-LD) was fixed across all 43 pages; watch for it recurring if pages are regenerated from a template.
- No testimonials, star ratings, or Review/AggregateRating schema — see `QA.md` for the full content QA checklist this site was built against.
- No street address anywhere (service-area business, not a storefront).
- Every page's `.footer-bottom` ends with a `<span class="footer-credit">Built and Maintained by <a href="https://infin8content.com/">Infin8Content</a></span>` line, present on all 69 pages — keep this on any newly generated page (e.g. future blog posts or service-area pages).

## Deployment

Deployed via Vercel, connected directly to this git repo (auto-deploy on push
to `main`). No local Vercel CLI needed to verify deploys — check the Vercel
dashboard.
