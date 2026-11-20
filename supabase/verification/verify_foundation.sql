-- Run on a dedicated dev/test database. Any failed assertion raises an error.
-- All Auth users, companies, memberships and warehouses below are rolled back.
begin;

do $$
begin
  if (select count(*) from public.roles) <> 5 then
    raise exception 'expected five roles';
  end if;
  if (select count(*) from pg_tables where schemaname = 'public' and tablename in
      ('profiles','companies','roles','memberships','invitations','audit_logs',
       'warehouse_regions','warehouses','user_warehouses') and rowsecurity) <> 9 then
    raise exception 'foundation table without RLS';
  end if;
  if has_table_privilege('authenticated', 'public.memberships', 'INSERT')
    or has_table_privilege('authenticated', 'public.audit_logs', 'INSERT') then
    raise exception 'client has direct write privileges';
  end if;
  if has_function_privilege('anon', 'public.create_company(text,text,text,text,text)', 'EXECUTE') then
    raise exception 'anonymous role can create companies';
  end if;
end;
$$;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foundation-a@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foundation-b@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foundation-viewer@example.test', '', now());

do $$
begin
  if (select count(*) from public.profiles where email like 'foundation-%@example.test') <> 3 then
    raise exception 'signup did not create exactly three profiles';
  end if;
  if (select count(*) from public.memberships) <> 0 then
    raise exception 'signup created a membership';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
do $$
declare first_id uuid; retry_id uuid;
begin
  first_id := public.create_company('Foundation A', 'foundation-a-verification');
  retry_id := public.create_company('Foundation A', 'foundation-a-verification');
  if first_id <> retry_id or public.current_role() <> 'OWNER' then
    raise exception 'owner creation or retry failed';
  end if;
  begin
    perform public.create_company('Second company', 'second-company-verification');
    raise exception 'second company was accepted';
  exception when unique_violation then null;
  end;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select public.create_company('Foundation B', 'foundation-b-verification');
reset role;

insert into public.memberships (user_id, company_id, role_code)
select '00000000-0000-4000-8000-000000000003', id, 'VIEWER'
from public.companies where slug = 'foundation-a-verification';
insert into public.warehouses (company_id, code, name)
select id, 'A1', 'A1' from public.companies where slug = 'foundation-a-verification';
insert into public.warehouses (company_id, code, name)
select id, 'A2', 'A2' from public.companies where slug = 'foundation-a-verification';
insert into public.warehouses (company_id, code, name)
select id, 'B1', 'B1' from public.companies where slug = 'foundation-b-verification';
insert into public.user_warehouses (company_id, user_id, warehouse_id)
select company_id, '00000000-0000-4000-8000-000000000003', id
from public.warehouses where code = 'A1';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
do $$
begin
  if (select count(*) from public.companies) <> 1 then
    raise exception 'viewer can read another company';
  end if;
  if (select count(*) from public.warehouses) <> 1 then
    raise exception 'viewer can read an unassigned warehouse';
  end if;
  if (select code from public.warehouses) <> 'A1' then
    raise exception 'viewer sees wrong warehouse';
  end if;
end;
$$;
reset role;

update public.profiles set status = 'inactive'
where id = '00000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
do $$
begin
  if public.current_company_id() is not null or (select count(*) from public.companies) <> 0 then
    raise exception 'inactive user can read company';
  end if;
end;
$$;
reset role;

update public.profiles set status = 'active'
where id = '00000000-0000-4000-8000-000000000003';
update public.companies set status = 'suspended'
where slug = 'foundation-a-verification';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
do $$
begin
  if public.current_company_id() is not null or (select count(*) from public.warehouses) <> 0 then
    raise exception 'suspended company remains accessible';
  end if;
end;
$$;
reset role;

rollback;
select 'foundation verification passed and fixtures rolled back' as result;
