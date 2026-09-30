-- Phase 4: dashboards + admin. Run after 001 and 002.

-- ───────────── link guest submissions to a real account ─────────────
-- Called by the app after login. Only links rows whose email matches the account's CONFIRMED email.
create or replace function public.link_account() returns void
language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  select lower(email) into v_email from auth.users where id = auth.uid() and email_confirmed_at is not null;
  if v_email is null then return; end if;
  update candidates set user_id = auth.uid() where user_id is null and lower(email) = v_email;
  update employers  set user_id = auth.uid() where user_id is null and lower(email) = v_email;
  update payments p set user_id = auth.uid()
    where p.user_id is null and (
      p.reference_id in (select r.id from candidate_job_requests r join candidates c on c.id = r.candidate_id where c.user_id = auth.uid())
      or p.reference_id in (select r.id from employer_requests r join employers e on e.id = r.employer_id where e.user_id = auth.uid()));
end $$;
grant execute on function public.link_account to authenticated;

-- A signed-in candidate without a profile row can create their own (profile editing).
create policy cand_owner_insert on public.candidates for insert with check (user_id = auth.uid());

-- ───────────── payments: owners can read payments for their own requests ─────────────
create policy pay_ref_owner_read on public.payments for select using (
  reference_id in (select r.id from public.candidate_job_requests r)      -- RLS on requests already limits to own rows
  or reference_id in (select r.id from public.employer_requests r)
);

-- ───────────── CV access via signed URLs ─────────────
-- Candidates can read their own CV; employers can read CVs of candidates matched to their positions.
create policy cv_owner_read on storage.objects for select using (
  bucket_id = 'cvs' and exists (select 1 from public.candidates c where c.user_id = auth.uid() and c.cv_url = name)
);
create policy cv_employer_read on storage.objects for select using (
  bucket_id = 'cvs' and exists (
    select 1 from public.matches m
    join public.candidates c on c.id = m.candidate_id
    join public.employer_positions p on p.id = m.position_id
    join public.employer_requests r on r.id = p.request_id
    join public.employers e on e.id = r.employer_id
    where e.user_id = auth.uid() and c.cv_url = name)
);

-- ───────────── employer view of matched candidates (limited columns; no email/phone) ─────────────
create or replace function public.employer_matches() returns table (
  match_id uuid, position_id uuid, request_id uuid, status text, shared_at timestamptz,
  full_name text, city text, experience_years numeric, current_company text, designation text,
  expected_ctc numeric, notice_period text, skills text[], qualification text, cv_url text)
language sql security definer set search_path = public stable as $$
  select m.id, m.position_id, p.request_id, m.status, m.shared_at,
         c.full_name, c.city, c.experience_years, c.current_company, c.designation,
         c.expected_ctc, c.notice_period, c.skills, c.qualification, c.cv_url
  from matches m
  join candidates c on c.id = m.candidate_id
  join employer_positions p on p.id = m.position_id
  join employer_requests r on r.id = p.request_id
  join employers e on e.id = r.employer_id
  where e.user_id = auth.uid()
  order by m.shared_at desc;
$$;
grant execute on function public.employer_matches to authenticated;

-- Employers can only move a match between shared / shortlisted / rejected (no direct UPDATE policy).
create or replace function public.set_match_status(p_match uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('shared','shortlisted','rejected') then raise exception 'invalid_status'; end if;
  update matches m set status = p_status
  where m.id = p_match and exists (
    select 1 from employer_positions p join employer_requests r on r.id = p.request_id join employers e on e.id = r.employer_id
    where p.id = m.position_id and e.user_id = auth.uid());
  if not found then raise exception 'not_found'; end if;
end $$;
grant execute on function public.set_match_status to authenticated;
