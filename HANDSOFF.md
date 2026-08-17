# Handoff — commercialcleanershugo.com

Status: **READY TO LAUNCH**

## What was done this session

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
