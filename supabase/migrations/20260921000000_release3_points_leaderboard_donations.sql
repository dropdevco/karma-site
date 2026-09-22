-- Karma Release 3
-- Points ledger, a leaderboard for the annual $400 prize, staff-logged
-- donation records, and a "brought a donation" flag wired through check-in.

-- ---------------------------------------------------------------------------
-- Tunable point values. A single row so an admin can adjust these from the
-- database without a redeploy; the trigger below reads it on every check-in.
-- ---------------------------------------------------------------------------

create table public.points_config (
  id boolean primary key default true check (id),
  attendance_points int not null default 10 check (attendance_points >= 0),
  donation_bonus_points int not null default 15 check (donation_bonus_points >= 0),
  updated_at timestamptz not null default now()
);

insert into public.points_config (id) values (true);

create trigger points_config_set_updated_at
  before update on public.points_config
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Points ledger. Append-only so every award and every correction is
-- auditable — the annual prize is real money, so "why does this member have
-- this many points" always needs an answer. Voiding fraudulent points (per
-- the Terms) is a negative row referencing what it reverses, never a delete
-- or an update to history.
-- ---------------------------------------------------------------------------

create table public.point_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  kind text not null check (kind in ('attendance', 'donation_bonus', 'adjustment')),
  points int not null,
  note text check (char_length(note) <= 500),
  reverses uuid references public.point_events (id),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index point_events_user_idx on public.point_events (user_id);
create index point_events_event_idx on public.point_events (event_id);

alter table public.profiles
  add column leaderboard_visible boolean not null default true;

-- ---------------------------------------------------------------------------
-- Check-ins gain a "brought a donation" flag, set by staff at scan time.
-- ---------------------------------------------------------------------------

alter table public.check_ins
  add column brought_donation boolean not null default false;

create or replace function public.award_points_for_checkin()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_attendance int;
  v_donation int;
begin
  select attendance_points, donation_bonus_points
    into v_attendance, v_donation
  from public.points_config where id = true;

  insert into public.point_events (user_id, event_id, kind, points, created_by)
  values (new.user_id, new.event_id, 'attendance', coalesce(v_attendance, 0), new.checked_in_by);

  if new.brought_donation then
    insert into public.point_events (user_id, event_id, kind, points, created_by)
    values (new.user_id, new.event_id, 'donation_bonus', coalesce(v_donation, 0), new.checked_in_by);
  end if;

  return null;
end;
$$;

create trigger check_ins_award_points
  after insert on public.check_ins
  for each row execute function public.award_points_for_checkin();

-- sync_check_ins is redefined (not altered) to add brought_donation to the
-- scan payload and to the inserted row; everything else is unchanged from
-- the Release 2 version.
create or replace function public.sync_check_ins(p_scans jsonb)
returns table (client_scan_id uuid, result text)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_staff uuid := auth.uid();
  v_scan jsonb;
  v_id uuid;
  v_event uuid;
  v_user uuid;
  v_method text;
  v_scanned timestamptz;
  v_donation boolean;
  v_window bigint;
  v_sig text;
  v_expected text;
  v_secret text;
  v_starts timestamptz;
  v_ends timestamptz;
  v_rows int;
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if jsonb_typeof(p_scans) <> 'array' then
    raise exception 'invalid_payload' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_scans) > 500 then
    raise exception 'batch_too_large' using errcode = 'P0001';
  end if;

  for v_scan in select value from jsonb_array_elements(p_scans) loop
    v_id := null;
    begin
      v_id := (v_scan ->> 'client_scan_id')::uuid;
      v_event := (v_scan ->> 'event_id')::uuid;
      v_user := (v_scan ->> 'user_id')::uuid;
      v_method := v_scan ->> 'method';
      v_scanned := (v_scan ->> 'scanned_at')::timestamptz;
      v_donation := coalesce((v_scan ->> 'brought_donation')::boolean, false);

      if v_id is null or v_event is null or v_user is null or v_scanned is null
         or v_method not in ('qr', 'manual') then
        client_scan_id := v_id; result := 'rejected:malformed'; return next; continue;
      end if;

      select e.starts_at, e.ends_at into v_starts, v_ends
      from public.events e where e.id = v_event;
      if not found then
        client_scan_id := v_id; result := 'rejected:event_not_found'; return next; continue;
      end if;

      if v_scanned > now() + interval '5 minutes'
         or v_scanned < v_starts - interval '3 hours'
         or v_scanned > v_ends + interval '3 hours' then
        client_scan_id := v_id; result := 'rejected:outside_event_window'; return next; continue;
      end if;

      select s.secret into v_secret
      from public.member_qr_secrets s where s.user_id = v_user;
      if not found then
        client_scan_id := v_id; result := 'rejected:member_not_found'; return next; continue;
      end if;

      if v_method = 'qr' then
        v_window := (v_scan ->> 'qr_window')::bigint;
        v_sig := v_scan ->> 'qr_sig';

        if v_window is null or v_sig is null then
          client_scan_id := v_id; result := 'rejected:missing_signature'; return next; continue;
        end if;

        if abs((v_window * 30) - extract(epoch from v_scanned)) > 90 then
          client_scan_id := v_id; result := 'rejected:stale_code'; return next; continue;
        end if;

        v_expected := rtrim(
          translate(
            encode(
              substring(
                extensions.hmac(
                  convert_to(v_user::text || '.' || v_window::text, 'UTF8'),
                  decode(v_secret, 'hex'),
                  'sha256'
                ) from 1 for 16
              ),
              'base64'
            ),
            '+/', '-_'
          ),
          '='
        );

        if v_expected is distinct from v_sig then
          client_scan_id := v_id; result := 'rejected:bad_signature'; return next; continue;
        end if;
      end if;

      insert into public.check_ins
        (event_id, user_id, method, scanned_at, checked_in_by, client_scan_id, brought_donation)
      values (v_event, v_user, v_method, v_scanned, v_staff, v_id, v_donation)
      on conflict do nothing;

      get diagnostics v_rows = row_count;

      if v_rows = 1 then
        client_scan_id := v_id; result := 'created';
      elsif exists (select 1 from public.check_ins c where c.client_scan_id = v_id) then
        client_scan_id := v_id; result := 'already_synced';
      else
        client_scan_id := v_id; result := 'duplicate';
      end if;
      return next;

    exception when others then
      client_scan_id := v_id; result := 'rejected:error'; return next;
    end;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Voiding fraudulent points (Terms: "the org may void points obtained by
-- fraud or check-in abuse"). Admin-only; writes an offsetting adjustment
-- rather than touching the original row, so the ledger stays append-only.
-- ---------------------------------------------------------------------------

create or replace function public.void_point_event(p_point_event_id uuid, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_row public.point_events;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_row from public.point_events where id = p_point_event_id;
  if not found then
    raise exception 'point_event_not_found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.point_events where reverses = p_point_event_id) then
    raise exception 'already_voided' using errcode = 'P0001';
  end if;

  insert into public.point_events (user_id, event_id, kind, points, note, reverses, created_by)
  values (v_row.user_id, v_row.event_id, 'adjustment', -v_row.points,
          coalesce(p_note, 'Voided'), p_point_event_id, auth.uid());
end;
$$;

-- ---------------------------------------------------------------------------
-- Leaderboard. Members can opt out of appearing in the public ranking
-- (profiles.leaderboard_visible); their own standing is always visible to
-- themselves regardless. Authenticated members only — this is the detailed,
-- named ranking; an aggregate public impact page is a later release.
-- ---------------------------------------------------------------------------

create or replace function public.get_leaderboard(p_limit int default 100)
returns table (user_id uuid, full_name text, total_points bigint, rank bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  -- GRANT/REVOKE alone cannot be trusted to keep this members-only: Supabase
  -- grants execute on public-schema functions broadly by default, so every
  -- function that must not be callable by a signed-out visitor checks
  -- auth.uid() itself, the same as register_for_event and its neighbors do.
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  return query
    with totals as (
      select p.id, p.full_name, coalesce(sum(pe.points), 0) as total_points
      from public.profiles p
      left join public.point_events pe on pe.user_id = p.id
      where p.leaderboard_visible and p.role = 'member'
      group by p.id, p.full_name
    )
    select t.id, t.full_name, t.total_points, dense_rank() over (order by t.total_points desc)
    from totals t
    order by t.total_points desc, t.full_name
    limit greatest(p_limit, 1);
end;
$$;

create or replace function public.get_my_points_summary()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_total bigint;
  v_rank bigint;
  v_member_count bigint;
begin
  if v_uid is null then
    return null;
  end if;

  with totals as (
    select p.id, coalesce(sum(pe.points), 0) as total_points
    from public.profiles p
    left join public.point_events pe on pe.user_id = p.id
    group by p.id
  ),
  ranked as (
    select id, total_points, dense_rank() over (order by total_points desc) as rank
    from totals
  )
  select total_points, rank into v_total, v_rank from ranked where id = v_uid;

  select count(*) into v_member_count from public.profiles;

  return jsonb_build_object(
    'total_points', coalesce(v_total, 0),
    'rank', v_rank,
    'member_count', v_member_count
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Donations. Aggregate per-event records staff log after collecting items —
-- not attributed to individual members (nobody weighs each can at the door).
-- Publicly readable, like events, for a future impact page; only staff write.
-- ---------------------------------------------------------------------------

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  description text not null check (char_length(description) between 1 and 300),
  quantity numeric check (quantity >= 0),
  unit text check (char_length(unit) <= 40),
  beneficiary_en text check (char_length(beneficiary_en) <= 200),
  beneficiary_es text check (char_length(beneficiary_es) <= 200),
  notes text check (char_length(notes) <= 1000),
  logged_by uuid references public.profiles (id) on delete set null,
  logged_at timestamptz not null default now()
);

create index donations_event_idx on public.donations (event_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.points_config enable row level security;
alter table public.point_events enable row level security;
alter table public.donations enable row level security;

create policy "Anyone reads point values" on public.points_config
  for select to anon, authenticated using (true);
create policy "Admins update point values" on public.points_config
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Members read own point events" on public.point_events
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_staff()));

create policy "Anyone reads donations" on public.donations
  for select to anon, authenticated using (true);
create policy "Staff log donations" on public.donations
  for insert to authenticated with check ((select public.is_staff()));
create policy "Staff update donation records" on public.donations
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

revoke all on public.points_config from anon, authenticated;
revoke all on public.point_events from anon, authenticated;
revoke all on public.donations from anon, authenticated;

grant select on public.points_config to anon, authenticated;
grant update (attendance_points, donation_bonus_points) on public.points_config to authenticated;
grant select on public.point_events to authenticated;
grant select on public.donations to anon, authenticated;
grant insert (event_id, description, quantity, unit, beneficiary_en, beneficiary_es, notes)
  on public.donations to authenticated;
grant update (description, quantity, unit, beneficiary_en, beneficiary_es, notes)
  on public.donations to authenticated;

grant update (leaderboard_visible) on public.profiles to authenticated;

revoke all on function public.award_points_for_checkin() from public, anon, authenticated;

revoke all on function public.get_leaderboard(int) from public;
revoke all on function public.get_my_points_summary() from public;
revoke all on function public.void_point_event(uuid, text) from public;

grant execute on function public.get_leaderboard(int) to authenticated;
grant execute on function public.get_my_points_summary() to authenticated;
grant execute on function public.void_point_event(uuid, text) to authenticated;
