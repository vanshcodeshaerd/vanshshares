-- Let the app work with the public (publishable/anon) key instead of the service-role key.
-- The signups table stays locked by RLS; these SECURITY DEFINER functions are the only way in:
--   * submit_signup: anyone can add one validated row
--   * admin_*: require the admin token, whose SHA-256 is stored in private.app_config

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  key text primary key,
  value text not null
);

create or replace function public.submit_signup(p_full_name text, p_alias text, p_college_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := trim(p_full_name);
  v_alias text := trim(p_alias);
  v_email text := lower(trim(p_college_email));
begin
  if v_name is null or length(v_name) not between 2 and 100
     or v_alias is null or v_alias !~ '^[A-Za-z0-9._-]{2,50}$'
     or v_email is null or v_email !~ '^[^@[:space:]]+@nuv\.ac\.in$' then
    raise exception 'invalid input' using errcode = '22023';
  end if;
  insert into public.signups (full_name, alias, college_email) values (v_name, v_alias, v_email);
end;
$$;

create or replace function private.check_admin(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected text := (select value from private.app_config where key = 'admin_token_sha256');
begin
  if p_token is null or v_expected is null
     or encode(extensions.digest(p_token, 'sha256'), 'hex') <> v_expected then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.admin_list_signups(p_token text)
returns setof public.signups
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.check_admin(p_token);
  return query select * from public.signups order by created_at desc;
end;
$$;

create or replace function public.admin_delete_signup(p_token text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.check_admin(p_token);
  delete from public.signups where id = p_id;
end;
$$;

revoke all on function private.check_admin(text) from public, anon, authenticated;
revoke all on function public.submit_signup(text, text, text) from public;
revoke all on function public.admin_list_signups(text) from public;
revoke all on function public.admin_delete_signup(text, uuid) from public;
grant execute on function public.submit_signup(text, text, text) to anon, authenticated;
grant execute on function public.admin_list_signups(text) to anon, authenticated;
grant execute on function public.admin_delete_signup(text, uuid) to anon, authenticated;

-- Then set the admin token hash (ADMIN_SESSION_SECRET from Vercel), outside version control:
--   insert into private.app_config (key, value)
--   values ('admin_token_sha256', encode(extensions.digest('<ADMIN_SESSION_SECRET>', 'sha256'), 'hex'))
--   on conflict (key) do update set value = excluded.value;
