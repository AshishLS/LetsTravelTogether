-- DSN Ride Pool Dashboard schema + security for Supabase

create extension if not exists pgcrypto;

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_name text not null,
  phone text not null,
  city text not null check (city in ('Pune', 'Mumbai', 'Kolhapur')),
  area text not null,
  vehicle_type text not null,
  total_seats integer not null check (total_seats > 0),
  departure_time timestamptz not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_name text not null,
  phone text not null,
  seats_requested integer not null check (seats_requested > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create unique index if not exists uniq_ride_phone on public.reservations(ride_id, phone);

alter table public.rides enable row level security;
alter table public.reservations enable row level security;

-- Public read/insert only (no login required)
drop policy if exists rides_public_select on public.rides;
create policy rides_public_select on public.rides
for select to anon using (true);

drop policy if exists rides_public_insert on public.rides;
create policy rides_public_insert on public.rides
for insert to anon with check (true);

drop policy if exists reservations_public_select on public.reservations;
create policy reservations_public_select on public.reservations
for select to anon using (true);

drop policy if exists reservations_public_insert on public.reservations;
create policy reservations_public_insert on public.reservations
for insert to anon with check (status = 'pending');

-- Admin password constant; match frontend env VITE_ADMIN_PASSWORD
-- Replace value before running in production.
create or replace function public.validate_admin_password(p_admin_password text)
returns boolean
language plpgsql
security definer
as $$
begin
  return p_admin_password = 'dsn-admin-2026';
end;
$$;

create or replace function public.admin_update_reservation_status(
  p_reservation_id uuid,
  p_status text,
  p_admin_password text
)
returns void
language plpgsql
security definer
as $$
declare
  v_ride_id uuid;
  v_seats_requested int;
  v_total int;
  v_approved int;
begin
  if not public.validate_admin_password(p_admin_password) then
    raise exception 'Unauthorized';
  end if;

  select ride_id, seats_requested into v_ride_id, v_seats_requested
  from public.reservations where id = p_reservation_id;

  if p_status = 'approved' then
    select total_seats into v_total from public.rides where id = v_ride_id;
    select coalesce(sum(seats_requested), 0) into v_approved
    from public.reservations
    where ride_id = v_ride_id and status = 'approved' and id <> p_reservation_id;

    if v_approved + v_seats_requested > v_total then
      raise exception 'Not enough available seats';
    end if;
  end if;

  update public.reservations
  set status = p_status
  where id = p_reservation_id;
end;
$$;

create or replace function public.admin_update_ride(
  p_ride_id uuid,
  p_area text,
  p_city text,
  p_vehicle_type text,
  p_total_seats int,
  p_departure_time timestamptz,
  p_admin_password text
)
returns void
language plpgsql
security definer
as $$
begin
  if not public.validate_admin_password(p_admin_password) then
    raise exception 'Unauthorized';
  end if;

  update public.rides
  set area = p_area,
      city = p_city,
      vehicle_type = p_vehicle_type,
      total_seats = p_total_seats,
      departure_time = p_departure_time
  where id = p_ride_id;
end;
$$;

create or replace function public.admin_delete_ride(
  p_ride_id uuid,
  p_admin_password text
)
returns void
language plpgsql
security definer
as $$
begin
  if not public.validate_admin_password(p_admin_password) then
    raise exception 'Unauthorized';
  end if;

  delete from public.rides where id = p_ride_id;
end;
$$;

grant execute on function public.admin_update_reservation_status(uuid, text, text) to anon;
grant execute on function public.admin_update_ride(uuid, text, text, text, int, timestamptz, text) to anon;
grant execute on function public.admin_delete_ride(uuid, text) to anon;
