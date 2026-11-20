-- Foundation only. Inventory tables and transactional stock RPCs follow in later migrations.
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  country_code text not null default 'VN' check (country_code ~ '^[A-Z]{2}$'),
  default_currency text not null default 'VND' check (default_currency ~ '^[A-Z]{3}$'),
  default_timezone text not null default 'Asia/Ho_Chi_Minh',
  industry_codes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  code text primary key,
  name text not null,
  description text not null default ''
);

insert into public.roles (code, name) values
  ('OWNER', 'Owner'), ('ADMIN', 'Admin'),
  ('WAREHOUSE_MANAGER', 'Warehouse Manager'),
  ('WAREHOUSE_STAFF', 'Warehouse Staff'), ('VIEWER', 'Viewer');

create table public.memberships (
  user_id uuid primary key references public.profiles(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  role_code text not null references public.roles(code),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, user_id)
);

-- One owner per company. Mutation is restricted to audited server functions.
create unique index memberships_one_owner_per_company
  on public.memberships (company_id) where role_code = 'OWNER';
create index memberships_company_idx on public.memberships (company_id);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_logs_company_time_idx on public.audit_logs (company_id, created_at desc);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role_code text not null references public.roles(code) check (role_code <> 'OWNER'),
  token_hash text not null unique,
  invited_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (accepted_at is null or revoked_at is null)
);
create index invitations_company_idx on public.invitations (company_id);

create table public.warehouse_regions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  name text not null check (length(btrim(name)) > 0),
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, name)
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  code text not null,
  name text not null,
  country_code text not null default 'VN' check (country_code ~ '^[A-Z]{2}$'),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  region_id uuid,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, code),
  foreign key (company_id, region_id) references public.warehouse_regions(company_id, id)
);

create table public.user_warehouses (
  company_id uuid not null,
  user_id uuid not null,
  warehouse_id uuid not null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, warehouse_id),
  foreign key (company_id, user_id) references public.memberships(company_id, user_id) on delete cascade,
  foreign key (company_id, warehouse_id) references public.warehouses(company_id, id) on delete cascade
);

-- Signup creates an identity profile only. It never creates a company or membership.
create function public.create_profile_for_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

-- SECURITY DEFINER helpers avoid recursive policies on memberships/profiles.
create function public.current_company_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select m.company_id from public.memberships m
  join public.profiles p on p.id = m.user_id
  join public.companies c on c.id = m.company_id
  where m.user_id = (select auth.uid()) and m.status = 'active'
    and p.status = 'active' and c.status = 'active';
$$;
create function public.current_role() returns text
language sql stable security definer set search_path = '' as $$
  select m.role_code from public.memberships m
  where m.user_id = (select auth.uid()) and m.company_id = public.current_company_id();
$$;
create function public.can_access_warehouse(target_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    public.current_role() in ('OWNER', 'ADMIN')
    or exists (
      select 1 from public.user_warehouses uw
      where uw.user_id = (select auth.uid())
        and uw.company_id = public.current_company_id()
        and uw.warehouse_id = target_id
    ), false);
$$;

-- User identity is authoritative. The caller never supplies owner_id or company_id.
create function public.create_company(
  company_name text, company_slug text,
  country text default 'VN', currency text default 'VND',
  timezone_name text default 'Asia/Ho_Chi_Minh'
) returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid; actor uuid := auth.uid();
begin
  if actor is null then raise exception 'authentication required' using errcode = '28000'; end if;
  perform 1 from public.profiles where id = actor and status = 'active' for update;
  if not found then raise exception 'active profile required' using errcode = '42501'; end if;
  if exists (select 1 from public.memberships where user_id = actor) then
    select c.id into new_id from public.memberships m
      join public.companies c on c.id = m.company_id
      where m.user_id = actor and m.role_code = 'OWNER'
        and c.slug = lower(btrim(company_slug)) and c.name = btrim(company_name);
    if new_id is not null then return new_id; end if;
    raise exception 'user already belongs to a company' using errcode = '23505';
  end if;
  insert into public.companies (name, slug, country_code, default_currency, default_timezone)
  values (btrim(company_name), lower(btrim(company_slug)), country, currency, timezone_name)
  returning id into new_id;
  insert into public.memberships (user_id, company_id, role_code)
  values (actor, new_id, 'OWNER');
  insert into public.audit_logs (company_id, actor_user_id, action, entity_type, entity_id)
  values (new_id, actor, 'COMPANY_CREATED', 'company', new_id);
  return new_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.roles enable row level security;
alter table public.memberships enable row level security;
alter table public.audit_logs enable row level security;
alter table public.invitations enable row level security;
alter table public.warehouse_regions enable row level security;
alter table public.warehouses enable row level security;
alter table public.user_warehouses enable row level security;

create policy profiles_read_self on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy companies_read_member on public.companies for select to authenticated
  using (id = (select public.current_company_id()));
create policy roles_read_member on public.roles for select to authenticated
  using ((select public.current_company_id()) is not null);
create policy memberships_read on public.memberships for select to authenticated
  using (user_id = (select auth.uid()) or
    (company_id = (select public.current_company_id()) and
     (select public.current_role()) in ('OWNER', 'ADMIN')));
create policy audit_logs_read_admin on public.audit_logs for select to authenticated
  using (company_id = (select public.current_company_id()) and
    (select public.current_role()) in ('OWNER', 'ADMIN'));
create policy regions_read_member on public.warehouse_regions for select to authenticated
  using (company_id = (select public.current_company_id()));
create policy warehouses_read_scoped on public.warehouses for select to authenticated
  using (company_id = (select public.current_company_id()) and
    public.can_access_warehouse(id));
create policy user_warehouses_read on public.user_warehouses for select to authenticated
  using (company_id = (select public.current_company_id()) and
    (user_id = (select auth.uid()) or (select public.current_role()) in ('OWNER', 'ADMIN')));

revoke all on public.profiles, public.companies, public.roles, public.memberships,
  public.audit_logs, public.invitations, public.warehouse_regions, public.warehouses,
  public.user_warehouses from anon, authenticated;
grant select on public.profiles, public.companies, public.roles, public.memberships,
  public.audit_logs, public.warehouse_regions, public.warehouses,
  public.user_warehouses to authenticated;
revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;
revoke all on function public.current_company_id() from public, anon;
revoke all on function public.current_role() from public, anon;
revoke all on function public.can_access_warehouse(uuid) from public, anon;
grant execute on function public.current_company_id(), public.current_role(),
  public.can_access_warehouse(uuid) to authenticated;
revoke all on function public.create_company(text, text, text, text, text) from public, anon;
grant execute on function public.create_company(text, text, text, text, text) to authenticated;
