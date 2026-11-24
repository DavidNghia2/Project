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
  if next_status = 'active' and next_role_code <> 'ADMIN' and cardinality(coalesce(warehouse_ids, '{}')) = 0 then
    raise exception 'at least one warehouse is required for non-admin roles' using errcode = '23514';
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
