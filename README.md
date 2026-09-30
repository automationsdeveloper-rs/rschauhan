# HireNest

React + Vite + Tailwind + Supabase. Brand name and content live in `src/config/site.js`.

## Run locally
```bash
npm install
npm run dev
```
Without Supabase keys the site runs in **demo mode** (seed jobs, applications kept in the browser).

## Supabase setup (project `svagcbfvejimczxtzydw`)
1. **Keys:** Dashboard → Project Settings → API. Copy the *anon public* key into `.env.local` as `VITE_SUPABASE_ANON_KEY`, then restart `npm run dev`.
2. **Schema:** Dashboard → SQL Editor → paste and run `supabase/migrations/001_init.sql`. It creates all tables, RLS policies, the `submit_application()` function and the private `cvs` bucket.
3. **Phase 3 schema:** run `supabase/migrations/002_requests_payments.sql` after 001.
4. **Phase 4 schema:** run `supabase/migrations/003_dashboards.sql`. It adds account linking, CV access for owners/employers, and the employer-safe matching functions.
5. **Sample jobs:** run `supabase/seed.sql` in the SQL Editor (20 jobs).
6. **Auth:** Authentication → URL Configuration: set *Site URL* to your site (`http://localhost:5173` for dev) and add `/login` and `/reset-password` to the Redirect URLs. For Google login: Authentication → Providers → Google.
7. **Make yourself admin** (after signing up once on the site):
   ```sql
   update public.users set role = 'admin' where email = 'you@example.com';
   ```
   Roles cannot be self-assigned: the signup trigger only ever creates `candidate` or `employer`.

## Confirmation emails (Vercel)
`api/send-confirmation.js` is a Vercel function. Set `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` in Vercel → Settings → Environment Variables. The service-role key must never be prefixed `VITE_`. While developing with plain `npm run dev` this endpoint does not exist; the call fails silently and the application is still saved.

## Payments (Razorpay)
1. Razorpay Dashboard → Settings → API Keys: create **Test** keys. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (server-side only; the browser receives just the key id from the API).
2. Settings → Webhooks → add `https://<your-domain>/api/razorpay-webhook`, events `payment.captured`, `order.paid`, `payment.failed`, and set a secret → `RAZORPAY_WEBHOOK_SECRET`. The webhook is the authoritative confirmation; the browser callback is a fast path.
3. Test cards/UPI: https://razorpay.com/docs/payments/payments/test-card-details/ . Switch to Live keys only after KYC.
4. Optional CAPTCHA: create a Cloudflare Turnstile widget → `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`. Unset = disabled.

Prices are defined once in `shared/plans.js`; the API recomputes the amount from the plan id, so the browser cannot change what is charged.

## Running the API locally
`npm run dev` serves only the frontend (payments show a clear "not available" message, or work in demo mode without Supabase keys). To exercise `/api/*` locally use `npx vercel dev` with the env vars in `.env.local`.

## Dashboards & admin
- `/dashboard/candidate`, `/dashboard/employer` and `/admin` are role-protected. Admins are created only by SQL (see step 7 above).
- Guest applications/requests are attached to an account automatically on login when the account's *confirmed* email matches (`link_account()`).
- Employers see matched candidates through `employer_matches()`, which exposes profile + CV but not email/phone.
- Status changes in the admin panel call `/api/notify-status` (admin-only) which sends the email and in-app notification. Set `SITE_URL` (e.g. `https://yourdomain.com`) for the email link.
- CSV exports open directly in Excel (UTF-8 with BOM; cells starting with `= + - @` are neutralised).
- In demo mode (no Supabase key) all three dashboards show read-only sample data.
