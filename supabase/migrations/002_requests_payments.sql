-- Phase 3: extra columns for job requests + storage folders for request CVs and employer JD files.

alter table public.candidate_job_requests
  add column if not exists relocate boolean,
  add column if not exists notice_period text,
  add column if not exists company_preferences text;

alter table public.payments add column if not exists receipt text;
create index if not exists payments_reference on public.payments (reference_id);

-- Uploads now go to applications/, requests/ (candidate CVs) or jd/ (employer job descriptions).
drop policy if exists cv_anon_upload on storage.objects;
create policy cv_anon_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] in ('applications', 'requests', 'jd'));

-- Requests and payments are created ONLY by the server (service role, bypasses RLS).
-- No insert policies exist for these tables, so the browser cannot forge a "paid" record.
-- Owners can already read their own rows via the policies from 001.
