-- Phase 5: contact-form subject, job-alert upsert, orphaned-upload cleanup. Run after 001–003.

alter table public.contact_messages add column if not exists subject text;
create index if not exists contact_messages_created on public.contact_messages (created_at desc);

-- Job alerts / newsletter: re-subscribing updates the preferences instead of failing on the unique email.
create or replace function public.subscribe_alerts(p_email text, p_role text default null, p_location text default null) returns void
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  insert into newsletter_subscribers (email, role_interest, location_interest)
  values (v_email, nullif(left(trim(p_role), 120), ''), nullif(left(trim(p_location), 120), ''))
  on conflict (email) do update set
    role_interest = coalesce(excluded.role_interest, newsletter_subscribers.role_interest),
    location_interest = coalesce(excluded.location_interest, newsletter_subscribers.location_interest);
end $$;
grant execute on function public.subscribe_alerts to anon, authenticated;

-- Files in the private cvs bucket older than p_days that nothing references (abandoned forms).
-- Service-role only: called by /api/cleanup-uploads (Vercel cron), which then deletes them via the Storage API.
create or replace function public.stale_uploads(p_days int default 7) returns setof text
language sql security definer set search_path = public, storage stable as $$
  select o.name from storage.objects o
  where o.bucket_id = 'cvs'
    and o.created_at < now() - make_interval(days => greatest(p_days, 1))
    and not exists (select 1 from public.candidates c where c.cv_url = o.name)
    and not exists (select 1 from public.applications a where a.cv_url = o.name)
    and not exists (select 1 from public.candidate_job_requests r where r.cv_url = o.name)
    and not exists (select 1 from public.employer_positions p where p.jd_file_url = o.name)
  limit 500;
$$;
revoke all on function public.stale_uploads(int) from public, anon, authenticated;
grant execute on function public.stale_uploads(int) to service_role;
