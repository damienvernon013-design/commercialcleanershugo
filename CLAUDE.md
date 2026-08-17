# commercialcleanershugo.com

Static HTML microsite for Hugo Commercial Cleaners (Hugo, MN), part of the QM
microsite portfolio (`thequotemasters.com` CRM backend). No build step, no
framework — plain HTML/CSS/JS deployed to Vercel.

## Structure

- 43 static pages under trailing-slash paths (`about/index.html`, `service-areas/<town>/index.html`, etc.)
- `styles.css` — single global stylesheet
- `utm-capture.js` — loaded on every page, captures `utm_*` query params into `sessionStorage`
- `form-handler.js` — loaded on the 3 pages with a lead form (`index.html`, `contact/`, `request-a-quote/`), submits via `fetch` to `/api/submit-lead`
- `api/submit-lead.js` — Vercel serverless function; proxies form submissions to the CRM (`thequotemasters.com/crm_api`), holding the Bearer token server-side
- `vercel.json` — security headers (HSTS, X-Frame-Options, etc.)

## CRM integration

Forms never talk to the CRM directly — the Bearer token must not reach the
browser. `api/submit-lead.js` reads `CRM_API_TOKEN` from a Vercel environment
variable and forwards to `POST https://thequotemasters.com/crm_api/api.php?action=push_lead`.

`industry` is hardcoded to `23` (Hugo Commercial Cleaners' CRM industry code).
`questions[]` is sent empty — this site doesn't collect a CRM-mapped
questionnaire, so no fabricated question/answer IDs are sent.

Set `CRM_API_TOKEN` in the Vercel project's Environment Variables (Production
+ Preview). Never commit it — see `.env.example` for the expected key name.

## Conventions

- All pages use absolute paths (`/styles.css`, `/utm-capture.js`) so nesting depth doesn't matter.
- JSON-LD `url` must match the page's canonical/OG URL on `commercialcleanershugo.com` — a prior domain-mismatch bug (`hugo-commercial-cleaners.com` in JSON-LD) was fixed across all 43 pages; watch for it recurring if pages are regenerated from a template.
- No testimonials, star ratings, or Review/AggregateRating schema — see `QA.md` for the full content QA checklist this site was built against.
- No street address anywhere (service-area business, not a storefront).

## Deployment

Deployed via Vercel, connected directly to this git repo (auto-deploy on push
to `main`). No local Vercel CLI needed to verify deploys — check the Vercel
dashboard.
