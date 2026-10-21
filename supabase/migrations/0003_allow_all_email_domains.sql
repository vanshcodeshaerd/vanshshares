-- Migration: Allow all email domains (Gmail, Yahoo, Outlook, custom domains, etc.)
-- Updates public.submit_signup to validate generic email format instead of restricting to @nuv.ac.in

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
     or v_email is null or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid input' using errcode = '22023';
  end if;
  insert into public.signups (full_name, alias, college_email) values (v_name, v_alias, v_email);
end;
$$;
