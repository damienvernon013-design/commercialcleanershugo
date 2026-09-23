# Handoff — commercialcleanershugo.com

Status: **READY TO LAUNCH** (see 2026-09-24 updates below for the blog + wizard pass and footer credit)

## 2026-09-24 update — footer credit line

Added a "Built and Maintained by Infin8Content" credit line, linking to
`https://infin8content.com/`, to the end of `.footer-bottom` on all 69 pages
(43 core pages + 25 blog posts + blog hub). Applied via a bulk script, then
verified present on every `index.html` in the repo. No layout changes beyond
the existing `.footer-bottom` flex row (already wraps on mobile).

## 2026-09-24 update — blog section + CRM quote wizard migration

Replicated the portfolio's blog + multi-step CRM quote wizard pattern
(documented in `Playbook Replicating This.md`) onto this site, per user
request. ZIP 55038 (Hugo, MN), domain `commercialcleanershugo.com`.

1. **Blog (25 posts + hub)** — `blog/<slug>/index.html` × 25 +
   `blog/index.html`, generated from the portfolio's generic
   commercial-cleaning content pack, rewritten for this site's brand. The
   3 off-scope posts (restaurants, gyms, schools/daycares — none of which
   this site quotes) were reframed as general facility-hygiene guidance
   instead of direct service claims. Unverifiable named-study citations
   (Princeton, ACI "88%", FitRated, NRA, specific OSHA CFR numbers) were
   softened to general unattributed claims. The source pack only supplied
   24 posts (numbered 2–25 with post 1 missing); a 25th post on
   warehouse/industrial cleaning was added to round out 25 and cover this
   site's own warehouse facility scope. "Blog" added to nav + footer on all
   43 core pages; all 26 new URLs added to `sitemap.xml`.
2. **CRM quote wizard migration** — replaced the old single-step
   `form-handler.js` / simple `api/submit-lead.js` with the portfolio's
   multi-step wizard:
   - `assets/js/quote-wizard.js` — copied unchanged (question set, answer
     IDs, appointment slots, and industry list are fixed CRM schema, not
     site-specific).
   - `api/submit-lead.js` — rewritten to the wizard's payload shape and
     validation rules (appointment date/weekday rules, CRM `num_of_quotes`
     key, `ResponseCode` 200/201 success check). `ZIP_DEFAULT` = `55038`,
     `ADDRESS_DEFAULT` = `'Hugo, MN'`, CORS origin =
     `https://commercialcleanershugo.com`. Added `SITE_SOURCE_TAG` (`'Site:
     commercialcleanershugo.com'`), prepended into `customer.notes` on every
     submission — **required** because `CRM_API_TOKEN` is shared across the
     whole portfolio and the CRM has no per-site field.
   - `industry` is now visitor-selected from the wizard's dropdown rather
     than hardcoded to `23`.
   - `/request-a-quote/` rebuilt with the wizard markup scaffold
     (`data-quote-wizard` + the six `data-wizard-*` hooks).
   - Home hero and `/contact/` converted to short teaser forms
     (`data-lead-teaser`, name+phone+sqft, GET to `/request-a-quote/`) that
     prefill the wizard via `prefillFromQuery()`.
   - `form-handler.js` deleted (nothing references it anymore).
   - Wizard CSS (`.wiz-*`) plus a `.btn-secondary` (needed for the wizard's
     Back button, which didn't exist in this site's button styles) appended
     to `styles.css`.
3. **Verification done**: `node --check` on both new JS files; grep swept
   for old-brand/old-domain leftovers (clean); all blog internal links
   resolve to real files; zero cross-portfolio outbound links; sitemap URL
   count (69) matches actual `index.html` file count (69); sitemap XML
   validated well-formed; local `python3 -m http.server` smoke test
   confirmed `/request-a-quote/` renders all 6 wizard hooks and both teaser
   forms render on `/` and `/contact/`.
4. **Not done — needs a human before launch**: the wizard has **not** been
   clicked through end-to-end in a real browser with a real CRM submission.
   Per the playbook, this is a hard requirement before this goes live — a
   full walkthrough (all question steps, appointment booking, details,
   review, submit) on a Vercel Preview deploy, confirming the lead actually
   lands in the CRM, has not been done in this session.

## What was done in the original build session

1. **Removed stray debris** — a leftover directory literally named
   `{about,contact,request-a-quote,...}` from a failed shell brace-expansion
   in an earlier session. Deleted.
2. **Fixed a domain-mismatch bug** — every page's JSON-LD `url` field pointed
   to `hugo-commercial-cleaners.com` while canonical/OG tags correctly used
   `commercialcleanershugo.com`. Fixed across all 43 pages.
3. **Wired up the CRM contact/quote form API**
   - Added `api/submit-lead.js`, a Vercel serverless function that proxies
     lead submissions to the CRM (`thequotemasters.com/crm_api`) using the
     Bearer token from a server-side env var (`CRM_API_TOKEN`) — the token
     never reaches the browser.
   - Added `form-handler.js`, loaded on the 3 pages with a lead form
     (homepage, `/contact/`, `/request-a-quote/`). Intercepts submit,
     validates required fields client-side, POSTs JSON to `/api/submit-lead`,
     shows inline success/error status, resets the form on success.
   - Maps site form fields → CRM `PushLead` payload. `industry` is fixed at
     `23` per the CRM docs' example for this business. `questions[]` is sent
     empty (no CRM questionnaire mapping exists for this site — didn't want
     to fabricate question/answer IDs).
4. **Configured UTM tracking** — `utm-capture.js` loads on all 43 pages,
   captures `utm_source/medium/campaign/term/content` from the landing URL
   into `sessionStorage`. `form-handler.js` reads it back at submit time and
   includes `utm_source` in the CRM payload (the CRM schema's `PushLead` only
   defines `utm_source`; the other four are captured for future use in
   analytics/logging if ever needed).
5. **Security**
   - Added `vercel.json` with HSTS, X-Frame-Options, X-Content-Type-Options,
     Referrer-Policy, Permissions-Policy headers.
   - Added `.gitignore` (excludes `.env*`) and `.env.example` (documents the
     `CRM_API_TOKEN` key without a value).
   - Confirmed no hardcoded secrets, API keys, or tokens anywhere in the
     committed codebase — the CRM Bearer token from the PDF is **not** in any
     file; it must be set manually as a Vercel environment variable (see
     below).
6. **Content QA re-verified** — no leftover placeholder tokens (`{{`, "lorem
   ipsum", TODO/TBD/FIXME, fake emails/keys), matches the existing `QA.md`
   checklist from the original build.

## Action required before traffic hits real CRM

**Set the `CRM_API_TOKEN` environment variable in the Vercel project**
(Production + Preview). It is not in the repo. Use the token from the CRM-QM
API Documentation PDF provided for this handoff. Without it, `/api/submit-lead`
returns a 500 and forms will show the error state.

## Not done (explicitly out of scope this session)

- **No automated testing** — per instruction, no test suite was added for
  the CRM integration. Recommend a manual test: submit each of the 3 forms
  in a Vercel Preview deploy and confirm the lead lands in the CRM.
- **No local Vercel CLI verification** — the repo is already connected to
  Vercel for auto-deploy; verify via the Vercel dashboard after push rather
  than `vercel dev`/`vercel build` locally.

## File map (new/changed)

- `api/submit-lead.js` — new, CRM proxy
- `form-handler.js` — new, form submit handler
- `utm-capture.js` — new, UTM capture (all pages)
- `vercel.json` — new, security headers
- `package.json` — new, minimal (required for Vercel to treat `api/` as functions)
- `.gitignore`, `.env.example` — new
- `styles.css` — added `.form-status` success/error states
- All 43 `index.html` pages — added `<script src="/utm-capture.js">`; fixed JSON-LD domain
- `index.html`, `contact/index.html`, `request-a-quote/index.html` — added `<script src="/form-handler.js">` before `</body>`
