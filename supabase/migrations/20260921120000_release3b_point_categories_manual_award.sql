-- Karma Release 3b
-- Per-event "extra ways to earn points" (bring clothes, bring food, ...),
-- selectable in any combination at check-in, replacing the single flat
-- "brought a donation" flag. Also: manual point awards not tied to a
-- check-in at all, and a staff member-search to support that.

-- ---------------------------------------------------------------------------
-- Per-event point categories. Staff define these on the event ("Bring
-- clothes" = 20 pts); check-in lets staff pick any number that apply to the
-- person in front of them. Publicly readable, like events, so a member could
-- eventually see "ways to earn more at this event" on the event page.
-- ---------------------------------------------------------------------------

create table public.event_point_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  label_en text not null check (char_length(label_en) between 1 and 120),
  label_es text not null check (char_length(label_es) between 1 and 120),
  points int not null check (points > 0 and points <= 10000),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index event_point_categories_event_idx on public.event_point_categories (event_id);

-- Which categories applied to a given check-in. Label and points are
-- snapshotted at award time so editing or deleting a category later never
-- rewrites what already happened.
create table public.check_in_point_categories (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.check_ins (id) on delete cascade,
  category_id uuid references public.event_point_categories (id) on delete set null,
  label_en text not null,
  label_es text not null,
  points_awarded int not null,
  created_at timestamptz not null default now()
);

create index check_in_point_categories_checkin_idx on public.check_in_point_categories (check_in_id);

-- ---------------------------------------------------------------------------
-- Replace the old single brought_donation flag and its bonus trigger. The
-- attendance award stays automatic on check-in; category bonuses are now
-- awarded explicitly inside sync_check_ins, since which categories applied
-- is a set chosen at scan time, not a single column.
-- ---------------------------------------------------------------------------

drop trigger if exists check_ins_award_points on public.check_ins;
drop function if exists public.award_points_for_checkin();

alter table public.check_ins drop column if exists brought_donation;
alter table public.points_config drop column if exists donation_bonus_points;

alter table public.point_events drop constraint if exists point_events_kind_check;
alter table public.point_events
  add constraint point_events_kind_check
  check (kind in ('attendance', 'category_bonus', 'manual', 'adjustment'));

create or replace function public.award_attendance_points()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_attendance int;
begin
  select attendance_points into v_attendance from public.points_config where id = true;

  insert into public.point_events (user_id, event_id, kind, points, created_by)
  values (new.user_id, new.event_id, 'attendance', coalesce(v_attendance, 0), new.checked_in_by);

  return null;
end;
$$;

create trigger check_ins_award_attendance
  after insert on public.check_ins
  for each row execute function public.award_attendance_points();

-- sync_check_ins is redefined again: brought_donation is gone, replaced by
-- an optional category_ids array per scan. A category only awards if it
-- belongs to the same event as the scan (a stale or tampered id is silently
-- skipped, never fails the whole check-in), and only on the branch where
-- the check-in row is newly created — a retried sync that hits
-- already_synced/duplicate never re-awards.
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
  v_category_ids uuid[];
  v_check_in_id uuid;
  v_cat_id uuid;
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
      select coalesce(array_agg(x::uuid), array[]::uuid[])
        into v_category_ids
        from jsonb_array_elements_text(coalesce(v_scan -> 'category_ids', '[]'::jsonb)) x;

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
        (event_id, user_id, method, scanned_at, checked_in_by, client_scan_id)
      values (v_event, v_user, v_method, v_scanned, v_staff, v_id)
      on conflict do nothing
      returning id into v_check_in_id;

      get diagnostics v_rows = row_count;

      if v_rows = 1 then
        foreach v_cat_id in array v_category_ids loop
          insert into public.check_in_point_categories
            (check_in_id, category_id, label_en, label_es, points_awarded)
          select v_check_in_id, c.id, c.label_en, c.label_es, c.points
          from public.event_point_categories c
          where c.id = v_cat_id and c.event_id = v_event;

          if found then
            insert into public.point_events (user_id, event_id, kind, points, note, created_by)
            select v_user, v_event, 'category_bonus', c.points, c.label_en, v_staff
            from public.event_point_categories c
            where c.id = v_cat_id and c.event_id = v_event;
          end if;
        end loop;

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
-- Manual point awards, not tied to any check-in. Any staff member can award
-- (e.g. "helped organize logistics, +20"); a note is required since real
-- money rides on the season total. Voiding a bad one still goes through the
-- existing admin-only void_point_event.
-- ---------------------------------------------------------------------------

create or replace function public.award_manual_points(p_user_id uuid, p_points int, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_points = 0 then
    raise exception 'invalid_points' using errcode = 'P0001';
  end if;
  if coalesce(btrim(p_note), '') = '' then
    raise exception 'note_required' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'member_not_found' using errcode = 'P0002';
  end if;

  insert into public.point_events (user_id, kind, points, note, created_by)
  values (p_user_id, 'manual', p_points, btrim(p_note), auth.uid());
end;
$$;

-- Staff-only member lookup for the manual-award picker. Returns only what
-- picking a name requires — never phone, DOB or emergency contact — so this
-- does not need to widen the general profiles read policy (a member can
-- otherwise only read their own row).
create or replace function public.search_members(p_query text default '')
returns table (user_id uuid, full_name text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select p.id, p.full_name
    from public.profiles p
    where p.role = 'member'
      and char_length(btrim(p.full_name)) > 0
      and (btrim(coalesce(p_query, '')) = '' or p.full_name ilike '%' || btrim(p_query) || '%')
    order by p.full_name
    limit 25;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.event_point_categories enable row level security;
alter table public.check_in_point_categories enable row level security;

create policy "Anyone reads point categories" on public.event_point_categories
  for select to anon, authenticated using (true);
create policy "Staff manage point categories" on public.event_point_categories
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "Members read their own check-in categories" on public.check_in_point_categories
  for select to authenticated
  using (
    exists (
      select 1 from public.check_ins c
      where c.id = check_in_point_categories.check_in_id
        and (c.user_id = (select auth.uid()) or (select public.is_staff()))
    )
  );

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

revoke all on public.event_point_categories from anon, authenticated;
revoke all on public.check_in_point_categories from anon, authenticated;

grant select on public.event_point_categories to anon, authenticated;
grant insert, update, delete on public.event_point_categories to authenticated;
grant select on public.check_in_point_categories to authenticated;

revoke all on function public.award_attendance_points() from public, anon, authenticated;

revoke all on function public.award_manual_points(uuid, int, text) from public;
revoke all on function public.search_members(text) from public;

grant execute on function public.award_manual_points(uuid, int, text) to authenticated;
grant execute on function public.search_members(text) to authenticated;
