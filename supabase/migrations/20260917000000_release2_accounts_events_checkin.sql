-- Karma Release 2
-- Member accounts, waiver log, events, registration with waitlist,
-- rotating member QR secrets, and check-ins that sync from offline devices.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Bump this together with the waiver text in the join locale files whenever
-- counsel revises the waiver. Members must re-accept before registering again.
create or replace function public.current_waiver_version()
returns text language sql immutable set search_path = '' as $$
  select '2026-09'::text;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 40),
  date_of_birth date check (date_of_birth > date '1900-01-01'),
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'es')),
  activities text[] not null default '{}'
    check (
      cardinality(activities) <= 10
      and activities <@ array['soccer', 'basketball', 'running', 'volleyball', 'other']::text[]
    ),
  emergency_contact_name text check (char_length(emergency_contact_name) <= 120),
  emergency_contact_phone text check (char_length(emergency_contact_phone) <= 40),
  photo_consent boolean not null default false,
  reminder_opt_in boolean not null default false,
  heard_about text check (heard_about in ('friend', 'event', 'social', 'search', 'other')),
  role text not null default 'member' check (role in ('member', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('staff', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.profile_is_complete(p_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_user_id
      and char_length(btrim(p.full_name)) > 0
      and char_length(coalesce(btrim(p.phone), '')) > 0
      and p.date_of_birth is not null
      and char_length(coalesce(btrim(p.emergency_contact_name), '')) > 0
      and char_length(coalesce(btrim(p.emergency_contact_phone), '')) > 0
  );
$$;

-- ---------------------------------------------------------------------------
-- Member QR secrets
-- Kept out of `profiles` so that reading a profile can never leak the key that
-- mints check-in codes. Staff receive these only through get_event_roster.
-- ---------------------------------------------------------------------------

create table public.member_qr_secrets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  secret text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  rotated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_lang text := new.raw_user_meta_data ->> 'preferred_language';
begin
  insert into public.profiles (id, preferred_language)
  values (new.id, case when v_lang in ('en', 'es') then v_lang else 'en' end)
  on conflict (id) do nothing;

  insert into public.member_qr_secrets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.rotate_my_qr_secret()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  update public.member_qr_secrets
  set secret = encode(extensions.gen_random_bytes(32), 'hex'), rotated_at = now()
  where user_id = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------------
-- Waiver acceptances (append-only legal log)
-- ---------------------------------------------------------------------------

create table public.waiver_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  waiver_version text not null check (char_length(waiver_version) <= 20),
  accepted_at timestamptz not null default now(),
  unique (user_id, waiver_version)
);

create or replace function public.accept_current_waiver()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  insert into public.waiver_acceptances (user_id, waiver_version)
  values (auth.uid(), public.current_waiver_version())
  on conflict (user_id, waiver_version) do nothing;
end;
$$;

create or replace function public.get_my_account_status()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_dob date;
  v_role text;
begin
  if v_uid is null then
    return null;
  end if;

  select date_of_birth, role into v_dob, v_role
  from public.profiles where id = v_uid;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'role', v_role,
    'profile_complete', public.profile_is_complete(v_uid),
    'is_adult', v_dob is not null and v_dob <= (current_date - interval '18 years')::date,
    'waiver_version', public.current_waiver_version(),
    'waiver_current', exists (
      select 1 from public.waiver_acceptances w
      where w.user_id = v_uid and w.waiver_version = public.current_waiver_version()
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  title_en text not null check (char_length(title_en) between 1 and 160),
  title_es text not null check (char_length(title_es) between 1 and 160),
  description_en text not null default '' check (char_length(description_en) <= 4000),
  description_es text not null default '' check (char_length(description_es) <= 4000),
  category text not null
    check (category in ('soccer', 'basketball', 'running', 'volleyball')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue_name text not null check (char_length(venue_name) between 1 and 160),
  venue_address text not null check (char_length(venue_address) between 1 and 300),
  capacity int not null check (capacity > 0 and capacity <= 10000),
  donation_item_en text not null default '' check (char_length(donation_item_en) <= 200),
  donation_item_es text not null default '' check (char_length(donation_item_es) <= 200),
  donation_suggestion_en text not null default '' check (char_length(donation_suggestion_en) <= 400),
  donation_suggestion_es text not null default '' check (char_length(donation_suggestion_es) <= 400),
  beneficiary_en text not null default '' check (char_length(beneficiary_en) <= 200),
  beneficiary_es text not null default '' check (char_length(beneficiary_es) <= 200),
  recurring boolean not null default false,
  series_id uuid,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index events_starts_at_idx on public.events (starts_at);
create index events_status_starts_idx on public.events (status, starts_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create or replace function public.events_force_created_by()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

create trigger events_set_created_by
  before insert on public.events
  for each row execute function public.events_force_created_by();

-- ---------------------------------------------------------------------------
-- Registrations
-- ---------------------------------------------------------------------------

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('registered', 'waitlisted', 'cancelled')),
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index registrations_event_status_idx
  on public.registrations (event_id, status, status_changed_at);
create index registrations_user_idx on public.registrations (user_id);

-- Fills open seats from the waitlist in join order. Callers hold the event row
-- lock, so this never double-promotes under concurrent cancellations.
create or replace function public.promote_waitlist(p_event_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_capacity int;
  v_taken int;
  v_next uuid;
  v_promoted int := 0;
begin
  select capacity into v_capacity from public.events where id = p_event_id for update;
  if not found then
    return 0;
  end if;

  loop
    select count(*) into v_taken
    from public.registrations
    where event_id = p_event_id and status = 'registered';

    exit when v_taken >= v_capacity;

    select id into v_next
    from public.registrations
    where event_id = p_event_id and status = 'waitlisted'
    order by status_changed_at, id
    limit 1;

    exit when v_next is null;

    update public.registrations
    set status = 'registered', status_changed_at = now()
    where id = v_next;

    v_promoted := v_promoted + 1;
  end loop;

  return v_promoted;
end;
$$;

create or replace function public.events_after_capacity_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.capacity > old.capacity then
    perform public.promote_waitlist(new.id);
  end if;
  return null;
end;
$$;

create trigger events_capacity_promote
  after update of capacity on public.events
  for each row execute function public.events_after_capacity_change();

create or replace function public.register_for_event(p_event_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_capacity int;
  v_status text;
  v_ends timestamptz;
  v_event_status text;
  v_dob date;
  v_taken int;
  v_existing text;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select capacity, ends_at, status into v_capacity, v_ends, v_event_status
  from public.events where id = p_event_id for update;

  if not found then
    raise exception 'event_not_found' using errcode = 'P0002';
  end if;
  if v_event_status <> 'scheduled' then
    raise exception 'event_cancelled' using errcode = 'P0001';
  end if;
  if v_ends <= now() then
    raise exception 'event_ended' using errcode = 'P0001';
  end if;

  if not public.profile_is_complete(v_uid) then
    raise exception 'profile_incomplete' using errcode = 'P0001';
  end if;

  select date_of_birth into v_dob from public.profiles where id = v_uid;
  if v_dob is null or v_dob > (current_date - interval '18 years')::date then
    raise exception 'under_18' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.waiver_acceptances
    where user_id = v_uid and waiver_version = public.current_waiver_version()
  ) then
    raise exception 'waiver_required' using errcode = 'P0001';
  end if;

  select status into v_existing
  from public.registrations
  where event_id = p_event_id and user_id = v_uid;

  if v_existing in ('registered', 'waitlisted') then
    return v_existing;
  end if;

  select count(*) into v_taken
  from public.registrations
  where event_id = p_event_id and status = 'registered';

  v_status := case when v_taken < v_capacity then 'registered' else 'waitlisted' end;

  insert into public.registrations (event_id, user_id, status, status_changed_at)
  values (p_event_id, v_uid, v_status, now())
  on conflict (event_id, user_id)
  do update set status = excluded.status, status_changed_at = now();

  return v_status;
end;
$$;

create or replace function public.cancel_my_registration(p_event_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_starts timestamptz;
  v_prev text;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select starts_at into v_starts from public.events where id = p_event_id for update;
  if not found then
    raise exception 'event_not_found' using errcode = 'P0002';
  end if;
  if v_starts <= now() then
    raise exception 'event_started' using errcode = 'P0001';
  end if;

  select status into v_prev
  from public.registrations
  where event_id = p_event_id and user_id = v_uid;

  if v_prev is null or v_prev = 'cancelled' then
    return;
  end if;

  update public.registrations
  set status = 'cancelled', status_changed_at = now()
  where event_id = p_event_id and user_id = v_uid;

  if v_prev = 'registered' then
    perform public.promote_waitlist(p_event_id);
  end if;
end;
$$;

-- Seat counts are public; who holds the seats is not.
create or replace function public.get_event_availability(p_event_ids uuid[] default null)
returns table (event_id uuid, capacity int, registered_count int, waitlist_count int)
language sql stable security definer set search_path = '' as $$
  select e.id, e.capacity,
    count(r.*) filter (where r.status = 'registered')::int,
    count(r.*) filter (where r.status = 'waitlisted')::int
  from public.events e
  left join public.registrations r on r.event_id = e.id
  where p_event_ids is null or e.id = any (p_event_ids)
  group by e.id, e.capacity;
$$;

-- ---------------------------------------------------------------------------
-- Walk-ins and check-ins
-- ---------------------------------------------------------------------------

create table public.walk_ins (
  -- Client-generated so an offline device can reference the row before sync.
  id uuid primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 120),
  email text check (char_length(email) <= 200),
  phone text check (char_length(phone) <= 40),
  emergency_contact_name text check (char_length(emergency_contact_name) <= 120),
  emergency_contact_phone text check (char_length(emergency_contact_phone) <= 40),
  confirmed_adult boolean not null check (confirmed_adult),
  waiver_acknowledged boolean not null check (waiver_acknowledged),
  waiver_version text not null check (char_length(waiver_version) <= 20),
  recorded_by uuid references public.profiles (id) on delete set null,
  recorded_at timestamptz not null,
  synced_at timestamptz not null default now()
);

create index walk_ins_event_idx on public.walk_ins (event_id);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  method text not null check (method in ('qr', 'manual')),
  -- Device clock at the moment of the scan; may predate synced_at by days.
  scanned_at timestamptz not null,
  synced_at timestamptz not null default now(),
  checked_in_by uuid references public.profiles (id) on delete set null,
  client_scan_id uuid not null unique
);

create unique index check_ins_one_per_member
  on public.check_ins (event_id, user_id);
create index check_ins_event_idx on public.check_ins (event_id);
create index check_ins_user_idx on public.check_ins (user_id);

-- Staff scanner roster. Cached on the device before doors open so check-in
-- works with no signal. Emergency contacts are exposed only for people who
-- actually hold a seat at this event.
create or replace function public.get_event_roster(p_event_id uuid)
returns table (
  user_id uuid,
  full_name text,
  qr_secret text,
  registration_status text,
  checked_in boolean,
  emergency_contact_name text,
  emergency_contact_phone text
)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if not exists (select 1 from public.events e where e.id = p_event_id) then
    raise exception 'event_not_found' using errcode = 'P0002';
  end if;

  return query
    select
      p.id,
      p.full_name,
      s.secret,
      r.status,
      exists (
        select 1 from public.check_ins c
        where c.event_id = p_event_id and c.user_id = p.id
      ),
      case when r.status in ('registered', 'waitlisted') then p.emergency_contact_name end,
      case when r.status in ('registered', 'waitlisted') then p.emergency_contact_phone end
    from public.profiles p
    join public.member_qr_secrets s on s.user_id = p.id
    left join public.registrations r
      on r.event_id = p_event_id and r.user_id = p.id and r.status <> 'cancelled'
    where char_length(btrim(p.full_name)) > 0
      and p.date_of_birth is not null
      and char_length(coalesce(btrim(p.emergency_contact_name), '')) > 0;
end;
$$;

-- Batch upload from the scanner's offline queue. Every scan is independently
-- validated and independently reported, so one bad row cannot fail the batch.
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

        -- Codes roll every 30s; allow three windows of clock drift either way.
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

create or replace function public.sync_walk_ins(p_walk_ins jsonb)
returns table (walk_in_id uuid, result text)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_staff uuid := auth.uid();
  v_row jsonb;
  v_id uuid;
  v_event uuid;
  v_recorded timestamptz;
  v_starts timestamptz;
  v_ends timestamptz;
  v_rows int;
begin
  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if jsonb_typeof(p_walk_ins) <> 'array' then
    raise exception 'invalid_payload' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_walk_ins) > 500 then
    raise exception 'batch_too_large' using errcode = 'P0001';
  end if;

  for v_row in select value from jsonb_array_elements(p_walk_ins) loop
    v_id := null;
    begin
      v_id := (v_row ->> 'id')::uuid;
      v_event := (v_row ->> 'event_id')::uuid;
      v_recorded := (v_row ->> 'recorded_at')::timestamptz;

      if v_id is null or v_event is null or v_recorded is null
         or coalesce(btrim(v_row ->> 'full_name'), '') = ''
         or (v_row ->> 'confirmed_adult')::boolean is not true
         or (v_row ->> 'waiver_acknowledged')::boolean is not true then
        walk_in_id := v_id; result := 'rejected:malformed'; return next; continue;
      end if;

      select e.starts_at, e.ends_at into v_starts, v_ends
      from public.events e where e.id = v_event;
      if not found then
        walk_in_id := v_id; result := 'rejected:event_not_found'; return next; continue;
      end if;

      if v_recorded > now() + interval '5 minutes'
         or v_recorded < v_starts - interval '3 hours'
         or v_recorded > v_ends + interval '3 hours' then
        walk_in_id := v_id; result := 'rejected:outside_event_window'; return next; continue;
      end if;

      insert into public.walk_ins (
        id, event_id, full_name, email, phone,
        emergency_contact_name, emergency_contact_phone,
        confirmed_adult, waiver_acknowledged, waiver_version,
        recorded_by, recorded_at
      )
      values (
        v_id, v_event, btrim(v_row ->> 'full_name'),
        nullif(btrim(coalesce(v_row ->> 'email', '')), ''),
        nullif(btrim(coalesce(v_row ->> 'phone', '')), ''),
        nullif(btrim(coalesce(v_row ->> 'emergency_contact_name', '')), ''),
        nullif(btrim(coalesce(v_row ->> 'emergency_contact_phone', '')), ''),
        true, true,
        coalesce(v_row ->> 'waiver_version', public.current_waiver_version()),
        v_staff, v_recorded
      )
      on conflict (id) do nothing;

      get diagnostics v_rows = row_count;
      walk_in_id := v_id;
      result := case when v_rows = 1 then 'created' else 'already_synced' end;
      return next;

    exception when others then
      walk_in_id := v_id; result := 'rejected:error'; return next;
    end;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.member_qr_secrets enable row level security;
alter table public.waiver_acceptances enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.walk_ins enable row level security;
alter table public.check_ins enable row level security;

create policy "Members read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Members update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Members read own QR secret" on public.member_qr_secrets
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Members read own waivers" on public.waiver_acceptances
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Anyone reads events" on public.events
  for select to anon, authenticated using (true);
create policy "Staff create events" on public.events
  for insert to authenticated with check ((select public.is_staff()));
create policy "Staff update events" on public.events
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "Admins delete events" on public.events
  for delete to authenticated using ((select public.is_admin()));

create policy "Members read own registrations" on public.registrations
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_staff()));

create policy "Members read own check-ins" on public.check_ins
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_staff()));

create policy "Staff read walk-ins" on public.walk_ins
  for select to authenticated using ((select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Privileges
-- Supabase grants broadly by default; narrow it down explicitly. Writes to
-- every table below happen through SECURITY DEFINER functions only.
-- ---------------------------------------------------------------------------

revoke all on public.profiles from anon, authenticated;
revoke all on public.member_qr_secrets from anon, authenticated;
revoke all on public.waiver_acceptances from anon, authenticated;
revoke all on public.events from anon, authenticated;
revoke all on public.registrations from anon, authenticated;
revoke all on public.walk_ins from anon, authenticated;
revoke all on public.check_ins from anon, authenticated;

grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant select on public.profiles to authenticated;
-- Column-scoped so a member can never promote themselves to staff.
grant update (
  full_name, phone, date_of_birth, preferred_language, activities,
  emergency_contact_name, emergency_contact_phone, photo_consent,
  reminder_opt_in, heard_about
) on public.profiles to authenticated;
grant select on public.member_qr_secrets to authenticated;
grant select on public.waiver_acceptances to authenticated;
grant select on public.registrations to authenticated;
grant select on public.check_ins to authenticated;
grant select on public.walk_ins to authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.profile_is_complete(uuid) from public, anon, authenticated;
revoke all on function public.promote_waitlist(uuid) from public, anon, authenticated;
revoke all on function public.events_after_capacity_change() from public, anon, authenticated;
revoke all on function public.events_force_created_by() from public, anon, authenticated;

revoke all on function public.current_waiver_version() from public;
revoke all on function public.is_staff() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.rotate_my_qr_secret() from public;
revoke all on function public.accept_current_waiver() from public;
revoke all on function public.get_my_account_status() from public;
revoke all on function public.register_for_event(uuid) from public;
revoke all on function public.cancel_my_registration(uuid) from public;
revoke all on function public.get_event_availability(uuid[]) from public;
revoke all on function public.get_event_roster(uuid) from public;
revoke all on function public.sync_check_ins(jsonb) from public;
revoke all on function public.sync_walk_ins(jsonb) from public;

grant execute on function public.current_waiver_version() to anon, authenticated;
grant execute on function public.get_event_availability(uuid[]) to anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.rotate_my_qr_secret() to authenticated;
grant execute on function public.accept_current_waiver() to authenticated;
grant execute on function public.get_my_account_status() to authenticated;
grant execute on function public.register_for_event(uuid) to authenticated;
grant execute on function public.cancel_my_registration(uuid) to authenticated;
grant execute on function public.get_event_roster(uuid) to authenticated;
grant execute on function public.sync_check_ins(jsonb) to authenticated;
grant execute on function public.sync_walk_ins(jsonb) to authenticated;
