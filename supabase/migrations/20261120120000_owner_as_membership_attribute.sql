-- Ownership is a membership property; ADMIN is one of the four application roles.
alter table public.memberships
  add column is_owner boolean not null default false;

update public.memberships
set role_code = 'ADMIN', is_owner = true
where role_code = 'OWNER';

drop index public.memberships_one_owner_per_company;
create unique index memberships_one_owner_per_company
  on public.memberships (company_id) where is_owner;

alter table public.memberships
  add constraint memberships_owner_must_be_admin check (not is_owner or role_code = 'ADMIN');

delete from public.roles where code = 'OWNER';

create or replace function public.can_access_warehouse(target_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    public.current_role() = 'ADMIN'
    or exists (
      select 1 from public.user_warehouses uw
      where uw.user_id = (select auth.uid())
        and uw.company_id = public.current_company_id()
        and uw.warehouse_id = target_id
    ), false);
$$;

create or replace function public.create_company(
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
      where m.user_id = actor and m.is_owner
        and c.slug = lower(btrim(company_slug)) and c.name = btrim(company_name);
    if new_id is not null then return new_id; end if;
    raise exception 'user already belongs to a company' using errcode = '23505';
  end if;
  insert into public.companies (name, slug, country_code, default_currency, default_timezone)
  values (btrim(company_name), lower(btrim(company_slug)), country, currency, timezone_name)
  returning id into new_id;
  insert into public.memberships (user_id, company_id, role_code, is_owner)
  values (actor, new_id, 'ADMIN', true);
  insert into public.audit_logs (company_id, actor_user_id, action, entity_type, entity_id)
  values (new_id, actor, 'COMPANY_CREATED', 'company', new_id);
  return new_id;
end;
$$;

drop policy memberships_read on public.memberships;
create policy memberships_read on public.memberships for select to authenticated
  using (user_id = (select auth.uid()) or
    (company_id = (select public.current_company_id()) and
     (select public.current_role()) = 'ADMIN'));

drop policy audit_logs_read_admin on public.audit_logs;
create policy audit_logs_read_admin on public.audit_logs for select to authenticated
  using (company_id = (select public.current_company_id()) and
    (select public.current_role()) = 'ADMIN');

drop policy user_warehouses_read on public.user_warehouses;
create policy user_warehouses_read on public.user_warehouses for select to authenticated
  using (company_id = (select public.current_company_id()) and
    (user_id = (select auth.uid()) or (select public.current_role()) = 'ADMIN'));
