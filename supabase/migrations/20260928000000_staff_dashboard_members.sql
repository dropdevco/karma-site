-- Staff dashboard: a read-only list of every account, and staff access for the
-- nonprofit's own account.
--
-- The general profiles read policy stays untouched (a member can only read their
-- own row). Staff get the wider view through this one security-definer function,
-- which re-checks is_staff() on every call, so a stale client cache cannot widen
-- access. Email lives in auth.users, which the browser can never read directly.

create or replace function public.staff_list_members()
returns table (
  user_id uuid,
  email text,
  full_name text,
  phone text,
  role text,
  preferred_language text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  total_points bigint,
  check_in_count bigint
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select
      p.id,
      u.email::text,
      p.full_name,
      p.phone,
      p.role,
      p.preferred_language,
      p.created_at,
      u.last_sign_in_at,
      coalesce((select sum(pe.points) from public.point_events pe where pe.user_id = p.id), 0)::bigint,
      (select count(*) from public.check_ins c where c.user_id = p.id)::bigint
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

revoke all on function public.staff_list_members() from public;
grant execute on function public.staff_list_members() to authenticated;

-- Promote the nonprofit's account to staff. Idempotent. The profile row only
-- exists once the account has signed up, so if this updates zero rows, sign in
-- once with that email and run this statement again.
update public.profiles p
set role = 'staff'
from auth.users u
where u.id = p.id
  and lower(u.email) = 'nonprofitkarma@gmail.com'
  and p.role = 'member';
