-- Photo & media release becomes a condition of membership, like the waiver.
-- Karma cannot pick individual people out of group photos, so there is no
-- opt-out: a profile is not "complete" (and so cannot register for events)
-- until the member has agreed.

alter table public.profiles add column photo_consent_at timestamptz;

-- Anyone who already ticked the old optional box keeps that consent, dated to
-- their last profile update (the best evidence available for when they agreed).
update public.profiles
set photo_consent_at = updated_at
where photo_consent and photo_consent_at is null;

-- The agreement date is recorded by the database, never supplied by the
-- client: photo_consent_at is deliberately not in the members' column grant.
create or replace function public.stamp_photo_consent()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.photo_consent then
    if old.photo_consent is distinct from true or new.photo_consent_at is null then
      new.photo_consent_at := now();
    end if;
  else
    new.photo_consent_at := null;
  end if;
  return new;
end;
$$;

create trigger profiles_stamp_photo_consent
  before update of photo_consent on public.profiles
  for each row execute function public.stamp_photo_consent();

revoke all on function public.stamp_photo_consent() from public, anon, authenticated;

-- A profile now also needs the photo release. Existing members who never
-- agreed become incomplete until they do; registration and the account
-- status both read this one function, so nothing else needs to change.
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
      and p.photo_consent
  );
$$;
