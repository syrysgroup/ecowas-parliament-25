-- Secure RBAC for admin and moderator access
create type public.app_role as enum ('admin', 'moderator');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Admins and moderators can view roles"
on public.user_roles
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

create policy "Admins manage roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Canonical countries for seat allocations and public display
create table public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  flag text not null,
  seats integer not null,
  sort_order integer not null,
  nomination_target integer not null default 200,
  created_at timestamptz not null default now()
);

alter table public.countries enable row level security;

create policy "Countries are publicly readable"
on public.countries
for select
using (true);

-- Extend profiles for public parliament presence
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists is_public boolean not null default false,
  add column if not exists title text,
  add column if not exists organisation text;

-- Remove broad profile search access and replace with safer public/admin policies
DROP POLICY IF EXISTS "Authenticated users can search profiles" ON public.profiles;

create policy "Users can read public profiles"
on public.profiles
for select
to authenticated
using (is_public = true);

create policy "Admins and moderators can read all profiles"
on public.profiles
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

-- Richer application workflow
alter table public.applications
  add column if not exists manifesto text,
  add column if not exists experience text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists moderator_notes text,
  add column if not exists score integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.applications
  add constraint applications_status_check
  check (status in ('pending', 'approved', 'rejected', 'withdrawn'));

create policy "Admins and moderators can read all applications"
on public.applications
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

create policy "Admins and moderators can update applications"
on public.applications
for update
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

-- Richer nomination workflow
alter table public.nominations
  add column if not exists status text not null default 'pending',
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists moderator_notes text,
  add column if not exists statement text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.nominations
  add constraint nominations_status_check
  check (status in ('pending', 'approved', 'rejected'));

create unique index if not exists nominations_one_per_nominator_nominee
on public.nominations (nominator_user_id, nominee_user_id);

create policy "Public can read approved nominations"
on public.nominations
for select
using (status = 'approved');

create policy "Admins and moderators can update nominations"
on public.nominations
for update
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

-- Voting with duplicate prevention
create table public.nomination_votes (
  id uuid primary key default gen_random_uuid(),
  nomination_id uuid not null references public.nominations(id) on delete cascade,
  voter_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (nomination_id, voter_user_id)
);

alter table public.nomination_votes enable row level security;

create policy "Votes are publicly readable"
on public.nomination_votes
for select
using (true);

create policy "Authenticated users cast one vote"
on public.nomination_votes
for insert
to authenticated
with check (auth.uid() = voter_user_id);

create policy "Admins and moderators can review votes"
on public.nomination_votes
for all
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

-- Published representatives for public display
create table public.representatives (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  country text not null,
  status text not null default 'verified',
  short_bio text,
  manifesto_summary text,
  headshot_url text,
  verified_by uuid,
  verified_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id)
);

alter table public.representatives enable row level security;

create policy "Representatives are publicly readable"
on public.representatives
for select
using (true);

create policy "Admins and moderators manage representatives"
on public.representatives
for all
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

-- Review log for dashboard traceability
create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_activity_logs enable row level security;

create policy "Admins and moderators can read activity logs"
on public.admin_activity_logs
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'moderator')
);

create policy "Admins and moderators write activity logs"
on public.admin_activity_logs
for insert
to authenticated
with check (
  auth.uid() = actor_user_id
  and (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'moderator')
  )
);

-- Public leaderboard and people views
create or replace view public.public_nominee_leaderboard as
select
  n.id,
  n.country,
  n.status,
  n.created_at,
  p.id as profile_id,
  p.full_name,
  p.country as profile_country,
  p.bio,
  p.avatar_url,
  p.title,
  p.organisation,
  count(v.id)::int as vote_count,
  count(*) over (partition by n.country)::int as country_nominee_count
from public.nominations n
join public.profiles p on p.id = n.nominee_user_id
left join public.nomination_votes v on v.nomination_id = n.id
where n.status = 'approved' and p.is_public = true
group by n.id, p.id;

create or replace view public.public_representatives as
select
  r.id,
  r.country,
  r.status,
  r.short_bio,
  r.manifesto_summary,
  r.headshot_url,
  r.verified_at,
  r.featured,
  p.id as profile_id,
  p.full_name,
  p.bio,
  p.avatar_url,
  p.title,
  p.organisation
from public.representatives r
join public.profiles p on p.id = r.profile_id
where p.is_public = true;

create or replace function public.get_nomination_count(nominee_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.nominations where nominee_user_id = nominee_id and status = 'approved';
$$;

create or replace function public.get_vote_count(_nomination_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.nomination_votes where nomination_id = _nomination_id;
$$;

-- Seed canonical countries if missing
insert into public.countries (name, code, flag, seats, sort_order, nomination_target)
values
  ('Benin', 'BJ', '🇧🇯', 5, 1, 200),
  ('Cape Verde', 'CV', '🇨🇻', 5, 2, 200),
  ('Gambia', 'GM', '🇬🇲', 5, 3, 200),
  ('Ghana', 'GH', '🇬🇭', 8, 4, 200),
  ('Guinea', 'GN', '🇬🇳', 6, 5, 200),
  ('Guinea-Bissau', 'GW', '🇬🇼', 5, 6, 200),
  ('Côte d''Ivoire', 'CI', '🇨🇮', 7, 7, 200),
  ('Liberia', 'LR', '🇱🇷', 5, 8, 200),
  ('Nigeria', 'NG', '🇳🇬', 35, 9, 200),
  ('Senegal', 'SN', '🇸🇳', 6, 10, 200),
  ('Sierra Leone', 'SL', '🇸🇱', 5, 11, 200),
  ('Togo', 'TG', '🇹🇬', 5, 12, 200)
on conflict (name) do update
set code = excluded.code,
    flag = excluded.flag,
    seats = excluded.seats,
    sort_order = excluded.sort_order,
    nomination_target = excluded.nomination_target;