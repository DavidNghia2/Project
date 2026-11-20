-- Run against the dedicated Supabase development project. Fixtures roll back.
begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'onboarding-owner@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'onboarding-viewer@example.test', '', now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);

do $$
declare new_company_id uuid; retry_id uuid;
begin
  new_company_id := public.onboard_company('Onboarding Verification', 'onboarding-verification', 'GENERAL');
  retry_id := public.onboard_company('Onboarding Verification', 'onboarding-verification', 'GENERAL');
  if new_company_id <> retry_id then
    raise exception 'onboarding retry created a duplicate company';
  end if;
  if not exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid() and m.company_id = new_company_id and m.role_code = 'ADMIN' and m.is_owner and m.status = 'active'
  ) then
    raise exception 'onboarding did not create the owner Admin membership';
  end if;
  if (select count(*) from public.categories c where c.company_id = new_company_id) < 2
    or (select count(*) from public.units u where u.company_id = new_company_id) < 3 then
    raise exception 'onboarding did not seed default categories and units';
  end if;

  perform set_config('verify.company_id', new_company_id::text, true);
end;
$$;

reset role;
with created_warehouse as (
  insert into public.warehouses (company_id, code, name)
  values (current_setting('verify.company_id')::uuid, 'V1', 'Verification Warehouse')
  returning id
)
select set_config('verify.warehouse_id', id::text, true) from created_warehouse;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);
do $$
declare invite_token text;
begin
  select invitation_token into invite_token
  from public.create_company_invitation(
    'onboarding-viewer@example.test',
    'VIEWER',
    array[current_setting('verify.warehouse_id')::uuid]
  );
  if invite_token is null then
    raise exception 'invitation token was not issued';
  end if;
  perform set_config('verify.invitation_token', invite_token, true);
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000012', true);
select public.accept_invitation(current_setting('verify.invitation_token'));

do $$
begin
  if public.current_role() <> 'VIEWER' then
    raise exception 'accepted invitation did not set Viewer role';
  end if;
  if (select count(*) from public.warehouses) <> 1 then
    raise exception 'Viewer can see warehouses outside assignment';
  end if;
  begin
    perform public.onboard_company('Second Company', 'onboarding-second-company', 'GENERAL');
    raise exception 'member created a second company';
  exception when unique_violation then null;
  end;
end;
$$;

rollback;
select 'auth and onboarding verification passed and fixtures rolled back' as result;
