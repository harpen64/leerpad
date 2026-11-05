-- Leerpad: database voor ouderoverzicht. Plak dit geheel in Supabase > SQL Editor > Run.
-- Veilig opnieuw uit te voeren.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  level text not null check (level in ('havo4', 'vwo1')),
  pin_hash text not null,
  state jsonb not null default '{}'::jsonb,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "ouder leest eigen gezin" on public.families;
create policy "ouder leest eigen gezin" on public.families for select to authenticated using (parent_id = auth.uid());
drop policy if exists "ouder leest eigen leerlingen" on public.profiles;
create policy "ouder leest eigen leerlingen" on public.profiles for select to authenticated
  using (family_id in (select id from public.families where parent_id = auth.uid()));

-- Tabellen zijn niet direct schrijfbaar of leesbaar voor leerlingen (anon). Alles loopt via de functies hieronder.
revoke all on public.families, public.profiles from anon, authenticated;
grant select on public.families to authenticated;
grant select (id, family_id, name, level, state, created_at, updated_at) on public.profiles to authenticated;

-- Intern: controleert pincode met begrenzing (5 fouten = 15 minuten geblokkeerd).
create or replace function public._check_pin(p_id uuid, p_pin text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare r public.profiles%rowtype;
begin
  select * into r from public.profiles where id = p_id for update;
  if not found then return 'bad_pin'; end if;
  if r.locked_until is not null and r.locked_until > now() then return 'locked'; end if;
  if r.pin_hash = crypt(coalesce(p_pin, ''), r.pin_hash) then
    if r.failed_attempts <> 0 or r.locked_until is not null then
      update public.profiles set failed_attempts = 0, locked_until = null where id = p_id;
    end if;
    return 'ok';
  end if;
  update public.profiles
     set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
         locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else null end
   where id = p_id;
  return 'bad_pin';
end $$;
revoke all on function public._check_pin(uuid, text) from public, anon, authenticated;

-- Leerling-functies (zonder account, met gezinscode + pincode)
create or replace function public.family_profiles(p_code text)
returns table (id uuid, name text, level text)
language sql security definer stable set search_path = public as $$
  select p.id, p.name, p.level from public.profiles p join public.families f on f.id = p.family_id
   where f.code = upper(trim(p_code)) order by p.created_at
$$;

create or replace function public.kid_login(p_id uuid, p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare s text; st jsonb;
begin
  s := public._check_pin(p_id, p_pin);
  if s <> 'ok' then return jsonb_build_object('status', s); end if;
  select state into st from public.profiles where id = p_id;
  return jsonb_build_object('status', 'ok', 'state', st);
end $$;

create or replace function public.kid_save(p_id uuid, p_pin text, p_state jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare s text;
begin
  s := public._check_pin(p_id, p_pin);
  if s <> 'ok' then return jsonb_build_object('status', s); end if;
  if octet_length(p_state::text) > 300000 then return jsonb_build_object('status', 'too_big'); end if;
  update public.profiles set state = p_state, updated_at = now() where id = p_id;
  return jsonb_build_object('status', 'ok');
end $$;

grant execute on function public.family_profiles(text), public.kid_login(uuid, text), public.kid_save(uuid, text, jsonb) to anon, authenticated;

-- Ouder-functies (ingelogd met e-mail + wachtwoord)
create or replace function public.parent_create_family() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v_uid uuid := auth.uid(); v_code text; i int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select code into v_code from public.families where parent_id = v_uid;
  if v_code is not null then return v_code; end if;
  loop
    v_code := '';
    for i in 1..6 loop v_code := v_code || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1); end loop;
    begin
      insert into public.families (parent_id, code) values (v_uid, v_code);
      return v_code;
    exception when unique_violation then
      select code into v_code from public.families where parent_id = v_uid;
      if v_code is not null then return v_code; end if;
    end;
  end loop;
end $$;

create or replace function public.parent_add_profile(p_name text, p_level text, p_pin text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_uid uuid := auth.uid(); v_fam uuid; v_id uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_pin !~ '^\d{4}$' then raise exception 'De pincode bestaat uit 4 cijfers.'; end if;
  select id into v_fam from public.families where parent_id = v_uid;
  if v_fam is null then raise exception 'Geen gezin gevonden.'; end if;
  if (select count(*) from public.profiles where family_id = v_fam) >= 8 then raise exception 'Maximaal 8 leerlingen per gezin.'; end if;
  insert into public.profiles (family_id, name, level, pin_hash) values (v_fam, trim(p_name), p_level, crypt(p_pin, gen_salt('bf'))) returning id into v_id;
  return v_id;
end $$;

create or replace function public.parent_set_pin(p_id uuid, p_pin text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_pin !~ '^\d{4}$' then raise exception 'De pincode bestaat uit 4 cijfers.'; end if;
  update public.profiles p set pin_hash = crypt(p_pin, gen_salt('bf')), failed_attempts = 0, locked_until = null
   where p.id = p_id and p.family_id in (select id from public.families where parent_id = auth.uid());
  if not found then raise exception 'Leerling niet gevonden.'; end if;
end $$;

create or replace function public.parent_delete_profile(p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from public.profiles p where p.id = p_id and p.family_id in (select id from public.families where parent_id = auth.uid());
end $$;

revoke all on function public.parent_create_family(), public.parent_add_profile(text, text, text), public.parent_set_pin(uuid, text), public.parent_delete_profile(uuid) from public, anon;
grant execute on function public.parent_create_family(), public.parent_add_profile(text, text, text), public.parent_set_pin(uuid, text), public.parent_delete_profile(uuid) to authenticated;
