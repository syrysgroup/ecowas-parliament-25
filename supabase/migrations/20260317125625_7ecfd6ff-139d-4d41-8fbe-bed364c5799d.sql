drop view if exists public.public_nominee_leaderboard;
drop view if exists public.public_representatives;

create view public.public_nominee_leaderboard
with (security_invoker = true)
as
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

create view public.public_representatives
with (security_invoker = true)
as
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