begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(13);
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

select * from finish();
rollback;
