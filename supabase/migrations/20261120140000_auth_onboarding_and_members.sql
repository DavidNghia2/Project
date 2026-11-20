-- D4: authenticated company onboarding, membership administration and invitation acceptance.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  code text not null,
  name text not null check (length(btrim(name)) between 1 and 120),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  code text not null,
  name text not null check (length(btrim(name)) between 1 and 120),
  symbol text not null check (length(btrim(symbol)) between 1 and 24),
  allows_decimal boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create index categories_company_idx on public.categories(company_id);
create index units_company_idx on public.units(company_id);

alter table public.invitations
  add column warehouse_ids uuid[] not null default '{}';

alter table public.categories enable row level security;
alter table public.units enable row level security;

create policy categories_read_member on public.categories for select to authenticated
  using (company_id = (select public.current_company_id()));
create policy units_read_member on public.units for select to authenticated
  using (company_id = (select public.current_company_id()));

grant select on public.categories, public.units to authenticated;

create or replace function public.onboard_company(
  company_name text,
  company_slug text,
  industry_code text default 'GENERAL'
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  new_company_id uuid;
  normalized_industry text := coalesce(nullif(upper(btrim(industry_code)), ''), 'GENERAL');
begin
  new_company_id := public.create_company(company_name, company_slug);

  update public.companies
  set industry_codes = array[normalized_industry], updated_at = now()
  where id = new_company_id;

  insert into public.categories (company_id, code, name)
  values
    (new_company_id, 'GENERAL', 'Hàng hóa chung'),
    (new_company_id, 'SUPPLIES', 'Vật tư')
  on conflict (company_id, code) do nothing;

  insert into public.units (company_id, code, name, symbol, allows_decimal)
  values
    (new_company_id, 'PIECE', 'Cái', 'cái', false),
    (new_company_id, 'CARTON', 'Thùng', 'thùng', false),
    (new_company_id, 'KILOGRAM', 'Kilogram', 'kg', true)
  on conflict (company_id, code) do nothing;

  insert into public.audit_logs (company_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (new_company_id, auth.uid(), 'COMPANY_ONBOARDED', 'company', new_company_id,
    jsonb_build_object('industry_code', normalized_industry));

  return new_company_id;
end;
$$;

create or replace function public.create_company_invitation(
  invitee_email text,
  invited_role text,
  warehouse_ids uuid[] default '{}',
  expires_in_hours integer default 168
) returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  current_company uuid := public.current_company_id();
  normalized_email text := lower(btrim(invitee_email));
  raw_token text := encode(extensions.gen_random_bytes(32), 'hex');
  role_exists boolean;
begin
  if actor is null or current_company is null or public.current_role() <> 'ADMIN' then
    raise exception 'admin permission required' using errcode = '42501';
  end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'valid invite email required' using errcode = '22023';
  end if;
  if expires_in_hours not between 1 and 720 then
    raise exception 'invitation expiry must be between 1 and 720 hours' using errcode = '22023';
  end if;
  select exists(select 1 from public.roles where code = invited_role) into role_exists;
  if not role_exists then
    raise exception 'valid role required' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(coalesce(warehouse_ids, '{}')) as assigned_id
    where not exists (select 1 from public.warehouses w where w.id = assigned_id and w.company_id = current_company)
  ) then
    raise exception 'warehouse must belong to the current company' using errcode = '23503';
  end if;

  update public.invitations
  set revoked_at = now()
  where company_id = current_company and lower(email) = normalized_email
    and accepted_at is null and revoked_at is null;

  insert into public.invitations as invitation (company_id, email, role_code, warehouse_ids, token_hash, invited_by, expires_at)
  values (
    current_company,
    normalized_email,
    invited_role,
    coalesce(warehouse_ids, '{}'),
    encode(extensions.digest(raw_token, 'sha256'), 'hex'),
    actor,
    now() + make_interval(hours => expires_in_hours)
  )
  returning invitation.id, invitation.expires_at into invitation_id, expires_at;

  insert into public.audit_logs (company_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (current_company, actor, 'MEMBER_INVITED', 'invitation', invitation_id,
    jsonb_build_object('email', normalized_email, 'role_code', invited_role, 'warehouse_ids', warehouse_ids));

  invitation_token := raw_token;
  return next;
end;
$$;

create or replace function public.accept_invitation(invitation_token text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  invitation public.invitations%rowtype;
  actor_profile public.profiles%rowtype;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  select * into actor_profile from public.profiles where id = actor and status = 'active';
  if not found then
    raise exception 'active profile required' using errcode = '42501';
  end if;
  select * into invitation from public.invitations
  where token_hash = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
  for update;
  if not found or invitation.accepted_at is not null or invitation.revoked_at is not null or invitation.expires_at <= now() then
    raise exception 'invitation is invalid or expired' using errcode = '22023';
  end if;
  if lower(actor_profile.email) <> lower(invitation.email) then
    raise exception 'invitation email does not match the signed-in account' using errcode = '42501';
  end if;
  if exists (select 1 from public.memberships where user_id = actor) then
    raise exception 'user already belongs to a company' using errcode = '23505';
  end if;

  insert into public.memberships (user_id, company_id, role_code)
  values (actor, invitation.company_id, invitation.role_code);
  if invitation.role_code <> 'ADMIN' then
    insert into public.user_warehouses (company_id, user_id, warehouse_id)
    select invitation.company_id, actor, assigned_id
    from unnest(invitation.warehouse_ids) as assigned_id;
  end if;
  update public.invitations set accepted_at = now() where id = invitation.id;
  insert into public.audit_logs (company_id, actor_user_id, action, entity_type, entity_id)
  values (invitation.company_id, actor, 'INVITATION_ACCEPTED', 'membership', actor);
end;
$$;

create or replace function public.list_company_members()
returns table(
  user_id uuid,
  full_name text,
  email text,
  role_code text,
  membership_status text,
  is_owner boolean,
  warehouse_ids uuid[],
  warehouse_codes text[]
)
language sql stable security definer set search_path = '' as $$
  select
    m.user_id,
    p.full_name,
    p.email,
    m.role_code,
    m.status,
    m.is_owner,
    coalesce(array_agg(uw.warehouse_id) filter (where uw.warehouse_id is not null), '{}'),
    coalesce(array_agg(w.code) filter (where w.code is not null), '{}')
  from public.memberships m
  join public.profiles p on p.id = m.user_id
  left join public.user_warehouses uw on uw.user_id = m.user_id and uw.company_id = m.company_id
  left join public.warehouses w on w.id = uw.warehouse_id and w.company_id = m.company_id
  where m.company_id = public.current_company_id() and public.current_role() = 'ADMIN'
  group by m.user_id, p.full_name, p.email, m.role_code, m.status, m.is_owner
  order by p.full_name;
$$;

create or replace function public.update_company_member(
  target_user_id uuid,
  next_role_code text,
  next_status text,
  warehouse_ids uuid[] default '{}'
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  current_company uuid := public.current_company_id();
  target public.memberships%rowtype;
  active_admin_count integer;
begin
  if actor is null or current_company is null or public.current_role() <> 'ADMIN' then
    raise exception 'admin permission required' using errcode = '42501';
  end if;
  if next_role_code not in ('ADMIN', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF', 'VIEWER')
    or next_status not in ('active', 'inactive') then
    raise exception 'invalid membership values' using errcode = '22023';
  end if;
  select * into target from public.memberships where user_id = target_user_id and company_id = current_company for update;
  if not found then
    raise exception 'member not found' using errcode = 'P0002';
  end if;
  if target.is_owner and (next_role_code <> 'ADMIN' or next_status <> 'active') then
    raise exception 'transfer ownership before changing the owner' using errcode = '23514';
  end if;
  perform 1 from public.memberships
  where company_id = current_company and role_code = 'ADMIN' and status = 'active'
  for update;
  if target.role_code = 'ADMIN' and target.status = 'active'
    and (next_role_code <> 'ADMIN' or next_status <> 'active') then
    select count(*) into active_admin_count from public.memberships
    where company_id = current_company and role_code = 'ADMIN' and status = 'active';
    if active_admin_count <= 1 then
      raise exception 'at least one active admin is required' using errcode = '23514';
    end if;
  end if;
  if exists (
    select 1 from unnest(coalesce(warehouse_ids, '{}')) as assigned_id
    where not exists (select 1 from public.warehouses w where w.id = assigned_id and w.company_id = current_company)
  ) then
    raise exception 'warehouse must belong to the current company' using errcode = '23503';
  end if;

  update public.memberships
  set role_code = next_role_code, status = next_status, updated_at = now()
  where user_id = target_user_id;
  delete from public.user_warehouses where user_id = target_user_id and company_id = current_company;
  if next_role_code <> 'ADMIN' and next_status = 'active' then
    insert into public.user_warehouses (company_id, user_id, warehouse_id)
    select current_company, target_user_id, assigned_id
    from unnest(coalesce(warehouse_ids, '{}')) as assigned_id;
  end if;
  insert into public.audit_logs (company_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (current_company, actor, 'MEMBER_UPDATED', 'membership', target_user_id,
    jsonb_build_object('role_code', next_role_code, 'status', next_status, 'warehouse_ids', warehouse_ids));
end;
$$;

create or replace function public.transfer_company_ownership(target_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  current_company uuid := public.current_company_id();
begin
  if actor is null or current_company is null then
    raise exception 'active membership required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.memberships
    where user_id = actor and company_id = current_company and is_owner and role_code = 'ADMIN' and status = 'active'
  ) then
    raise exception 'owner permission required' using errcode = '42501';
  end if;
  if target_user_id = actor or not exists (
    select 1 from public.memberships
    where user_id = target_user_id and company_id = current_company and role_code = 'ADMIN' and status = 'active'
  ) then
    raise exception 'target must be another active admin in this company' using errcode = '22023';
  end if;

  update public.memberships set is_owner = false, updated_at = now()
  where user_id = actor and company_id = current_company;
  update public.memberships set is_owner = true, updated_at = now()
  where user_id = target_user_id and company_id = current_company;
  insert into public.audit_logs (company_id, actor_user_id, action, entity_type, entity_id)
  values (current_company, actor, 'OWNERSHIP_TRANSFERRED', 'membership', target_user_id);
end;
$$;

revoke all on function public.onboard_company(text, text, text) from public, anon;
revoke all on function public.create_company_invitation(text, text, uuid[], integer) from public, anon;
revoke all on function public.accept_invitation(text) from public, anon;
revoke all on function public.list_company_members() from public, anon;
revoke all on function public.update_company_member(uuid, text, text, uuid[]) from public, anon;
revoke all on function public.transfer_company_ownership(uuid) from public, anon;
grant execute on function public.onboard_company(text, text, text) to authenticated;
grant execute on function public.create_company_invitation(text, text, uuid[], integer) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.list_company_members() to authenticated;
grant execute on function public.update_company_member(uuid, text, text, uuid[]) to authenticated;
grant execute on function public.transfer_company_ownership(uuid) to authenticated;
