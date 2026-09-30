# HireNest

A two-sided recruitment marketplace for India: candidates apply to open jobs for free or pay for a recruiter-led **Job Request**; employers raise paid **Hiring Requests** and receive verified profiles in 48 hours; an admin panel runs the agency.

**Stack:** React 19 + Vite · Tailwind CSS · Framer Motion · React Hook Form + Zod · Supabase (Postgres, Auth, Storage) · Razorpay · Resend · Vercel (serverless functions + cron) · Recharts · Vitest.

The brand name and contact details live in `src/config/site.js`; prices in `shared/plans.js`; all home/nav copy in `src/i18n/en.js` and `hi.js`.

---

## Contents
1. [Features](#features)
2. [Project structure](#project-structure)
3. [Run locally](#run-locally)
4. [Environment variables](#environment-variables)
5. [Supabase setup](#1-supabase)
6. [Razorpay](#2-razorpay)
7. [Resend (email)](#3-resend-email)
8. [Cloudflare Turnstile (optional)](#4-cloudflare-turnstile-optional)
9. [Analytics](#5-analytics)
10. [Deploy to Vercel](#6-deploy-to-vercel)
11. [Post-deploy checklist](#post-deploy-checklist)
12. [Tests](#tests)
13. [Customising](#customising)
14. [Security notes](#security-notes)
15. [Known limitations](#known-limitations)

---

## Features
| Area | What is included |
|---|---|
| Home | Animated hero with parallax cards and cursor spotlight, partner marquee, animated counters, two-path cards, featured jobs, tabbed *How it works* with scroll-drawn line, bento *Why us*, industries, pricing preview, testimonial carousel, FAQ accordion, CTA banner |
| Jobs | `/jobs` with URL-synced filters (search, location, type, work mode, experience and salary sliders, industry, date), sort, pagination, skeletons, animated empty state → *Raise a Job Request*, job-alert signup; `/jobs/:id` with sticky apply panel, share, similar jobs, `JobPosting` JSON-LD |
| Apply | Validated form, +91 phone, skills tags, drag-and-drop CV upload with progress (PDF/DOC/DOCX ≤ 5 MB, enforced by the bucket too), duplicate-application guard in the DB, honeypot, confetti success, confirmation email |
| Job Request (candidates) | 5-step form with animated progress, draft saved across refreshes, plan picker, Razorpay checkout, success timeline |
| Hiring Request (employers) | 5-step form, multiple positions per request, JD upload, plan gating by position count, Razorpay checkout |
| Pricing | Candidate/Employer toggle, plan cards, comparison table, pricing FAQ; prices defined once in `shared/plans.js` and re-computed on the server |
| Auth | Email + password, Google login (candidates), forgot/reset password, role-protected routes (candidate / employer / admin) |
| Candidate dashboard | Profile completion ring + checklist, application tracker, job requests, saved jobs, CV view/replace (signed URLs), profile editor, notifications, skill-match recommendations |
| Employer dashboard | Request tracker, shared candidate profiles with shortlist/reject (no contact details exposed), payments with printable GST invoice |
| Admin | Overview charts (applications/day, revenue/day, pipeline) with table views, candidates (filters, CSV), applications (status → email + notification), job requests, employer requests with candidate matching, jobs CRUD, payments, contact messages & alert subscribers |
| Site | About, Contact (form → DB + emails, map, WhatsApp), Privacy / Terms / Refund policies, custom 404, English ⇄ Hindi toggle, dark mode, cookie consent, floating WhatsApp, SEO (OG/Twitter tags, canonical, sitemap, robots, Organization JSON-LD), GA4 + Vercel Analytics, WCAG-AA colour tokens, reduced-motion support |

## Project structure
```
api/                      Vercel serverless functions (Node)
  _lib.js                 shared: Supabase service client, rate limit, Turnstile, mail, requireAdmin
  create-order.js         validates a request server-side, stores it, creates the Razorpay order
  verify-payment.js       HMAC check after checkout → marks paid, emails
  razorpay-webhook.js     authoritative payment confirmation (raw-body signature)
  send-confirmation.js    application confirmation email
  notify-status.js        admin-only: status-change email + in-app notification
  contact.js              contact form (CAPTCHA, rate limit, DB, emails)
  sitemap.js              /sitemap.xml with every open job
  cleanup-uploads.js      nightly cron: deletes orphaned CV/JD files
shared/                   code used by BOTH browser and API
  plans.js                pricing + GST maths
  schemas.js              Zod schemas for every public form
src/
  config/site.js          brand, contacts, nav, stats, industries
  i18n/                   en.js, hi.js, provider + useLang()
  components/             ui/ (Button, Motion helpers), layout/, home/, jobs/, forms/, dashboard/, pricing/
  pages/                  routes; pages/admin/*, pages/dashboard/*
  lib/                    supabase client, jobs/payment/contact APIs, hooks, upload, analytics, dashboard helpers
  data/                   seed jobs, testimonials, FAQs (demo mode)
supabase/
  migrations/001–004.sql  schema, RLS, functions, storage policies (run in order)
  seed.sql                20 sample jobs
tests/                    Vitest unit + component tests
```

## Run locally
```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit + component tests
npm run build        # production build → dist/
```
Without `VITE_SUPABASE_ANON_KEY` the site runs in **demo mode**: seed jobs, fake payments, sample dashboards, nothing saved. Forms show a "Demo mode" notice.

`npm run dev` serves only the frontend. The `/api/*` functions run on Vercel (or locally with `npx vercel dev`). Without them: applications still save (direct RPC), the contact form falls back to a direct insert, and payments show a clear "not available" message.

## Environment variables
Copy `.env.example` → `.env.local` for development; add the same keys in Vercel → Settings → Environment Variables for production.

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | browser | Supabase project URL + *anon public* key |
| `VITE_SITE_NAME` | browser/API | brand name in emails |
| `VITE_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | browser / API | optional CAPTCHA on request + contact forms |
| `VITE_GA_ID` | browser | optional GA4 id; loads only after cookie consent |
| `SITE_URL` | build + API | absolute site URL for robots.txt, sitemap, OG tags, email links |
| `SUPABASE_SERVICE_ROLE_KEY` | API only | bypasses RLS. **Never** prefix with `VITE_` |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` | API | transactional email |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | API | payments (the browser receives only the key id from the API) |
| `CRON_SECRET` | API | protects the cleanup cron endpoint |

## 1. Supabase
1. Create a project at supabase.com (this repo was built against project `svagcbfvejimczxtzydw`).
2. **Keys:** Project Settings → API. Put the URL and *anon public* key in `.env.local`; keep the *service_role* key for Vercel only.
3. **Schema:** SQL Editor → run, in order, `supabase/migrations/001_init.sql`, `002_requests_payments.sql`, `003_dashboards.sql`, `004_phase5.sql`. They create every table, Row Level Security policies, the private `cvs` bucket (5 MB, PDF/DOC/DOCX only), and the functions the app calls (`submit_application`, `link_account`, `employer_matches`, `set_match_status`, `subscribe_alerts`, `stale_uploads`).
4. **Sample jobs:** run `supabase/seed.sql`.
5. **Auth:** Authentication → URL Configuration → *Site URL* = your domain (or `http://localhost:5173`), *Redirect URLs* += `<site>/login`, `<site>/reset-password`. Optional: Providers → Google (paste the OAuth client id/secret from Google Cloud; add Supabase's callback URL there).
6. **Email templates** (Authentication → Email Templates): optional branding for confirm / reset emails.
7. **Make yourself admin** after signing up once on the site:
   ```sql
   update public.users set role = 'admin' where email = 'you@example.com';
   ```
   Roles can never be self-assigned: the signup trigger only creates `candidate` or `employer`.

## 2. Razorpay
1. Dashboard → Settings → API Keys → generate **Test** keys → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
2. Settings → Webhooks → Add: URL `https://<your-domain>/api/razorpay-webhook`, events `payment.captured`, `order.paid`, `payment.failed`, a secret → `RAZORPAY_WEBHOOK_SECRET`. The webhook is the authoritative confirmation; the browser callback is only the fast path.
3. Test with the cards/UPI ids from razorpay.com/docs/payments/payments/test-card-details.
4. After KYC, swap to **Live** keys in Vercel and redeploy. Prices come from `shared/plans.js`; the API recomputes the amount from the plan id so the browser cannot change what is charged.

## 3. Resend (email)
1. resend.com → Domains → add your domain and create the DNS records it shows (SPF, DKIM). Until verified you can only send to your own address.
2. API Keys → create → `RESEND_API_KEY`. Set `EMAIL_FROM="HireNest <no-reply@yourdomain.com>"` and `ADMIN_NOTIFY_EMAIL`.
Emails sent: application confirmation, payment receipts, status changes (admin panel), contact-form copy + admin alert.

## 4. Cloudflare Turnstile (optional)
Cloudflare dashboard → Turnstile → Add widget (your domain, *Managed*). Set `VITE_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Unset = the widget is hidden and the check is skipped. It protects the Job Request, Hiring Request and Contact forms; the Apply form relies on the honeypot + DB duplicate guard.

## 5. Analytics
- **Vercel Analytics** (cookieless): enable in Vercel → project → Analytics. The `<Analytics />` component is already mounted.
- **Google Analytics 4**: set `VITE_GA_ID`. The script loads only after a visitor clicks *Accept* on the cookie banner; page views are sent on every route change. `trackEvent(name, params)` in `src/lib/analytics.js` is available for custom events.

## 6. Deploy to Vercel
1. Push the repo to GitHub (already at `automationsdeveloper-rs/rschauhan`).
2. vercel.com → *Add New → Project* → import the repo. Framework preset **Vite** is detected (build `vite build`, output `dist`).
3. Add every variable from the table above (Production + Preview). Set `SITE_URL` to the final domain (`https://yourdomain.com`), no trailing slash.
4. Deploy. `vercel.json` provides: SPA rewrite, `/sitemap.xml` → API, security headers, immutable caching for `/assets`, and the nightly cleanup cron (`0 3 * * *`).
5. **Domain:** Settings → Domains → add yours, follow the DNS instructions; then update Supabase Site URL/Redirect URLs, Razorpay webhook URL and Google OAuth redirect to the new domain, and redeploy so `SITE_URL` is baked into `robots.txt` and the OG tags.
6. Local check of the functions: `npx vercel dev` with `.env.local` filled in.

## Post-deploy checklist
- [ ] `https://<domain>/sitemap.xml` lists the static pages + jobs; `/robots.txt` points to it
- [ ] Share the home URL in WhatsApp/Slack: the `og.png` preview appears
- [ ] Sign up → confirmation email arrives → make yourself admin → `/admin` opens
- [ ] Apply to a job → confirmation email; the application appears in Admin → Applications
- [ ] Raise a Job Request with a Razorpay **test** payment → `payments.status = paid`, receipt email, request visible in both dashboards
- [ ] Change an application status in Admin → candidate gets email + in-app notification
- [ ] Contact form → row in Admin → Messages, admin email + auto-reply
- [ ] Lighthouse (Chrome DevTools) on `/` and `/jobs`: Performance / Accessibility / Best practices / SEO ≥ 90
- [ ] Replace placeholders: team names in `src/pages/About.jsx`, partner logos in `src/config/site.js`, legal text reviewed by a lawyer, `site.address/phone/email`

## Tests
```bash
npm test
```
Vitest + Testing Library cover the shared validation schemas (job request, hiring request, contact), pricing/GST maths, the job filter, CSV export hardening (formula injection), Hindi ⇄ English dictionary parity, and the FAQ accordion's keyboard/ARIA behaviour.

## Customising
- **Brand / contacts:** `src/config/site.js` (name, email, phone, WhatsApp, address, hours, socials). The `<title>`/OG text in `index.html` and `public/og.png` are static — edit them too.
- **Copy:** `src/i18n/en.js` (English) and `src/i18n/hi.js` (Hindi) for nav, home, jobs page, footer. Other pages, forms, dashboards and legal text are English-only (in their own files).
- **Prices / plans:** `shared/plans.js` — used by the UI *and* the payment API.
- **Jobs:** Admin → Jobs (or `supabase/seed.sql`). Job detail fallbacks (responsibilities/requirements/benefits) live in `src/data/jobs.js`.
- **Legal pages:** `src/pages/Legal.jsx` — template policies for an Indian recruitment business; review with a lawyer.
- **Team & timeline:** `src/pages/About.jsx`.
- **Colours:** `tailwind.config.js` + the CSS variables at the top of `src/styles/index.css` (text colours are theme-aware and AA-checked; `--grad-ui` is the darker gradient used wherever white text sits on it).

## Security notes
- All writes that matter (requests, payments, matches, status changes) go through server code or `security definer` functions; the browser has no insert policy on requests/payments, so a "paid" record cannot be forged.
- CVs are in a private bucket; only the owner, matched employers and admins can obtain a 2-minute signed URL. Employers never see candidate email/phone.
- Razorpay signatures are verified with `timingSafeEqual`; the webhook checks the raw body.
- API rate limiting is per serverless instance (best effort). For a hard limit add Upstash/Vercel KV in `api/_lib.js`.
- Service-role key, Razorpay secret, Resend key and Turnstile secret exist only in Vercel env vars.

## Known limitations
- The site is a client-rendered SPA: social/OG previews work (static tags), Google indexes it fine, but other crawlers may see less. If organic SEO becomes critical, add prerendering or move the public pages to Next.js.
- Employers cannot sign up with Google (they use email); Google sign-ups are created as candidates.
- OTP login, resume parsing (auto-fill from CV) and Excel `.xlsx` export are not implemented (CSV opens in Excel).
- Hindi covers navigation, home, jobs list and footer; forms, dashboards, legal and job content remain English.
- No automated end-to-end payment test: verify the Razorpay flow manually with test keys before going live.
