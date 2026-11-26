create function public.get_my_access_context() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'profile', jsonb_build_object('email', p.email, 'full_name', p.full_name, 'status', p.status),
    'access', case
      when p.status <> 'active' then 'inactive'
      when m.user_id is null then 'no-company'
      when m.status <> 'active' then 'inactive'
      when c.id is null then 'suspended'
      else 'ready'
    end,
    'company', case when c.id is not null then
      jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
    end,
    'role', case when c.id is not null then m.role_code end,
    'owner', coalesce(c.id is not null and m.is_owner, false),
    'warehouses', coalesce((
      select jsonb_agg(w.code order by w.code)
      from public.warehouses w
      where w.company_id = c.id and w.status = 'active'
    ), '[]'::jsonb)
  )
  from public.profiles p
  left join public.memberships m on m.user_id = p.id
  left join public.companies c on c.id = m.company_id
    and c.status = 'active' and m.status = 'active' and p.status = 'active'
  where p.id = (select auth.uid());
$$;

revoke all on function public.get_my_access_context() from public, anon;
grant execute on function public.get_my_access_context() to authenticated;
