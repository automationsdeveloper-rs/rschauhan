-- HireNest schema. Run in Supabase Dashboard > SQL Editor (or `supabase db push`).
-- Salary values are in LPA (lakhs per annum); experience in years.

create extension if not exists pgcrypto;

-- ───────────── helpers ─────────────
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique not null,
  phone text,
  role text not null default 'candidate' check (role in ('candidate','employer','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- Create a public.users row for every new auth user. Role comes from signup metadata,
-- but 'admin' can NEVER be self-assigned: promote manually (see README).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    case when new.raw_user_meta_data->>'role' = 'employer' then 'employer' else 'candidate' end
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── core tables ─────────────
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  email text not null unique,
  phone text,
  city text,
  experience_years numeric(4,1),
  current_company text,
  designation text,
  current_ctc numeric,
  expected_ctc numeric,
  notice_period text,
  skills text[] default '{}',
  qualification text,
  linkedin_url text,
  cv_url text,                       -- storage path in private 'cvs' bucket
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company_name text not null,
  company_logo text,
  location text not null,
  job_type text not null check (job_type in ('Full-time','Part-time','Contract','Internship')),
  work_mode text not null check (work_mode in ('Onsite','Hybrid','Remote')),
  salary_min numeric, salary_max numeric,
  exp_min numeric default 0, exp_max numeric,
  skills text[] default '{}',
  description text,
  responsibilities text[] default '{}',
  requirements text[] default '{}',
  benefits text[] default '{}',
  industry text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
create index jobs_status_created on public.jobs (status, created_at desc);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  cover_note text,
  cv_url text,
  status text not null default 'applied' check (status in ('applied','under_review','shortlisted','interview','selected','rejected')),
  created_at timestamptz not null default now(),
  unique (job_id, candidate_id)      -- prevents duplicate applications
);

create table public.candidate_job_requests (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  request_code text unique,
  desired_role text not null,
  industry text,
  preferred_locations text[] default '{}',
  job_type text, work_mode text,
  expected_salary numeric,
  summary text,
  cv_url text,
  plan text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  status text not null default 'submitted',
  assigned_recruiter text,
  admin_notes text,
  created_at timestamptz not null default now()
);

create table public.employers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  company_name text not null,
  industry text, size text, website text,
  contact_person text, designation text,
  email text not null, phone text, city text
);

create table public.employer_requests (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.employers(id) on delete cascade,
  request_code text unique,
  plan text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  status text not null default 'submitted' check (status in ('submitted','in_progress','profiles_shared','closed')),
  assigned_recruiter text,
  admin_notes text,
  created_at timestamptz not null default now()
);

create table public.employer_positions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.employer_requests(id) on delete cascade,
  job_title text not null, department text,
  openings int default 1, employment_type text, work_mode text, location text, urgency text,
  exp_min numeric, exp_max numeric, budget_min numeric, budget_max numeric,
  skills text[] default '{}', qualification text,
  job_description text, jd_file_url text, notes text
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.employer_positions(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  status text not null default 'shared' check (status in ('shared','shortlisted','rejected')),
  shared_at timestamptz not null default now(),
  unique (position_id, candidate_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  type text not null check (type in ('candidate_request','employer_request')),
  reference_id uuid,
  amount numeric not null,
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text, message text not null,
  created_at timestamptz not null default now()
);
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique, role_interest text, location_interest text,
  created_at timestamptz not null default now()
);
create table public.saved_jobs (
  user_id uuid not null references public.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null, body text, read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────────── Row Level Security ─────────────
alter table public.users enable row level security;
alter table public.candidates enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.candidate_job_requests enable row level security;
alter table public.employers enable row level security;
alter table public.employer_requests enable row level security;
alter table public.employer_positions enable row level security;
alter table public.matches enable row level security;
alter table public.payments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.notifications enable row level security;

-- users: read/update own row (role is locked below), admin full access
create policy users_self_read on public.users for select using (id = auth.uid() or public.is_admin());
create policy users_self_update on public.users for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.users where id = auth.uid()));
create policy users_admin_all on public.users for all using (public.is_admin()) with check (public.is_admin());

-- jobs: anyone reads open jobs; admin manages
create policy jobs_public_read on public.jobs for select using (status = 'open' or public.is_admin());
create policy jobs_admin_write on public.jobs for all using (public.is_admin()) with check (public.is_admin());

-- candidates: owner (by user_id) + admin. Anonymous applicants go through submit_application().
create policy cand_owner_read on public.candidates for select using (user_id = auth.uid() or public.is_admin());
create policy cand_owner_update on public.candidates for update using (user_id = auth.uid());
create policy cand_admin_all on public.candidates for all using (public.is_admin()) with check (public.is_admin());

create policy app_owner_read on public.applications for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and c.user_id = auth.uid()) or public.is_admin());
create policy app_admin_all on public.applications for all using (public.is_admin()) with check (public.is_admin());

create policy cjr_owner_read on public.candidate_job_requests for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and c.user_id = auth.uid()) or public.is_admin());
create policy cjr_admin_all on public.candidate_job_requests for all using (public.is_admin()) with check (public.is_admin());

create policy emp_owner_read on public.employers for select using (user_id = auth.uid() or public.is_admin());
create policy emp_admin_all on public.employers for all using (public.is_admin()) with check (public.is_admin());

create policy er_owner_read on public.employer_requests for select
  using (exists (select 1 from public.employers e where e.id = employer_id and e.user_id = auth.uid()) or public.is_admin());
create policy er_admin_all on public.employer_requests for all using (public.is_admin()) with check (public.is_admin());

create policy ep_owner_read on public.employer_positions for select
  using (exists (select 1 from public.employer_requests r join public.employers e on e.id = r.employer_id
                 where r.id = request_id and e.user_id = auth.uid()) or public.is_admin());
create policy ep_admin_all on public.employer_positions for all using (public.is_admin()) with check (public.is_admin());

create policy match_employer_read on public.matches for select
  using (exists (select 1 from public.employer_positions p join public.employer_requests r on r.id = p.request_id
                 join public.employers e on e.id = r.employer_id where p.id = position_id and e.user_id = auth.uid()) or public.is_admin());
create policy match_admin_all on public.matches for all using (public.is_admin()) with check (public.is_admin());

create policy pay_owner_read on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy pay_admin_all on public.payments for all using (public.is_admin()) with check (public.is_admin());

-- public forms: insert-only for everyone, read for admin
create policy contact_insert on public.contact_messages for insert with check (true);
create policy contact_admin_read on public.contact_messages for select using (public.is_admin());
create policy news_insert on public.newsletter_subscribers for insert with check (true);
create policy news_admin_read on public.newsletter_subscribers for select using (public.is_admin());

create policy saved_owner on public.saved_jobs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notif_owner_read on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy notif_owner_update on public.notifications for update using (user_id = auth.uid());
create policy notif_admin_all on public.notifications for all using (public.is_admin()) with check (public.is_admin());

-- ───────────── submit_application(): the only way to apply ─────────────
-- SECURITY DEFINER so guests can apply without table access. Validates server-side,
-- upserts the candidate by email, and rejects duplicates (same job + same email).
create or replace function public.submit_application(
  p_job_id uuid, p_full_name text, p_email text, p_phone text, p_city text,
  p_company text, p_designation text, p_exp_years numeric, p_current_ctc numeric, p_expected_ctc numeric,
  p_notice_period text, p_skills text[], p_qualification text, p_linkedin text, p_cover_note text, p_cv_path text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_cid uuid; v_app uuid; v_email text := lower(trim(p_email));
begin
  if length(trim(p_full_name)) < 2 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_input';
  end if;
  if not exists (select 1 from jobs where id = p_job_id and status = 'open') then
    raise exception 'job_not_available';
  end if;
  if p_cv_path is null or p_cv_path !~ '^applications/' then
    raise exception 'cv_required';
  end if;

  -- Existing accounts (user_id set) are never overwritten by anonymous submissions.
  insert into candidates (full_name, email, phone, city, experience_years, current_company, designation,
                          current_ctc, expected_ctc, notice_period, skills, qualification, linkedin_url, cv_url, user_id)
  values (trim(p_full_name), v_email, p_phone, p_city, p_exp_years, p_company, p_designation,
          p_current_ctc, p_expected_ctc, p_notice_period, coalesce(p_skills,'{}'), p_qualification, nullif(p_linkedin,''), p_cv_path,
          (select id from users where id = auth.uid()))
  on conflict (email) do update set
    full_name = excluded.full_name, phone = excluded.phone, city = excluded.city,
    experience_years = excluded.experience_years, current_company = excluded.current_company,
    designation = excluded.designation, current_ctc = excluded.current_ctc, expected_ctc = excluded.expected_ctc,
    notice_period = excluded.notice_period, skills = excluded.skills, qualification = excluded.qualification,
    linkedin_url = excluded.linkedin_url, cv_url = excluded.cv_url
  where candidates.user_id is null or candidates.user_id = auth.uid();

  select id into v_cid from candidates where email = v_email;

  begin
    insert into applications (job_id, candidate_id, cover_note, cv_url)
    values (p_job_id, v_cid, left(p_cover_note, 2000), p_cv_path) returning id into v_app;
  exception when unique_violation then
    raise exception 'duplicate_application';
  end;
  return v_app;
end $$;
grant execute on function public.submit_application to anon, authenticated;

-- ───────────── Storage: private CV bucket ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may upload into applications/ (write-only); nobody but admin can read via API.
-- Owners get signed URLs from server code / dashboards in Phase 4.
create policy cv_anon_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'applications');
create policy cv_admin_read on storage.objects for select using (bucket_id = 'cvs' and public.is_admin());
create policy cv_admin_delete on storage.objects for delete using (bucket_id = 'cvs' and public.is_admin());
