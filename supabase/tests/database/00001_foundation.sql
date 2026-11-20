begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(21);
select has_table('public', 'profiles', 'global user profiles exist');
select has_table('public', 'memberships', 'membership table exists');
select has_table('public', 'invitations', 'invitations table exists');
select has_table('public', 'warehouses', 'warehouse table exists');
select has_function('public', 'create_company', array['text','text','text','text','text'], 'company RPC exists');
select is((select count(*)::integer from public.roles), 5, 'five roles including OWNER');
select is((select relrowsecurity from pg_class where oid = 'public.memberships'::regclass), true, 'memberships RLS enabled');
select is((select relrowsecurity from pg_class where oid = 'public.invitations'::regclass), true, 'invitations RLS enabled');
select is((select relrowsecurity from pg_class where oid = 'public.warehouses'::regclass), true, 'warehouses RLS enabled');
select is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'invitations'), 0, 'invitations deny all direct access');
select is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and cmd <> 'SELECT'), 0, 'audit cannot be written directly');
select is(has_table_privilege('authenticated', 'public.memberships', 'INSERT'), false, 'members cannot insert memberships directly');
select is(has_table_privilege('authenticated', 'public.audit_logs', 'INSERT'), false, 'clients cannot insert audit logs directly');

-- Transactional fixtures: Auth identities are global, memberships are created separately.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foundation-a@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foundation-b@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'foundation-viewer@example.test', '', now());
select is((select count(*)::integer from public.profiles where email like 'foundation-%@example.test'), 3, 'signup trigger creates global profiles');
select is((select count(*)::integer from public.memberships), 0, 'signup creates no memberships');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select lives_ok($$select public.create_company('Foundation A', 'foundation-a-test')$$, 'first user can create company A');
select is((select public.current_role()), 'OWNER', 'creator is owner');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select lives_ok($$select public.create_company('Foundation B', 'foundation-b-test')$$, 'second user can create separate company B');
reset role;

select is((select count(*)::integer from public.memberships where user_id = '00000000-0000-4000-8000-000000000001'), 1, 'one membership per owner');

-- A Viewer in company A sees its assigned warehouse, not A's other warehouse or B's.
insert into public.memberships (user_id, company_id, role_code)
select '00000000-0000-4000-8000-000000000003', id, 'VIEWER'
from public.companies where slug = 'foundation-a-test';
insert into public.warehouses (company_id, code, name)
select id, 'A1', 'A1' from public.companies where slug = 'foundation-a-test';
insert into public.warehouses (company_id, code, name)
select id, 'A2', 'A2' from public.companies where slug = 'foundation-a-test';
insert into public.warehouses (company_id, code, name)
select id, 'B1', 'B1' from public.companies where slug = 'foundation-b-test';
insert into public.user_warehouses (company_id, user_id, warehouse_id)
select company_id, '00000000-0000-4000-8000-000000000003', id
from public.warehouses where code = 'A1';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
select is((select count(*)::integer from public.companies), 1, 'viewer sees only its company');
select is((select count(*)::integer from public.warehouses), 1, 'viewer sees only assigned warehouse');
reset role;

select * from finish();
rollback;
