-- ============================================================================
-- Al-Tomoh — migration v3: harden signup
-- Run once on an existing database.
--
-- Makes the "create a profile on signup" trigger defensive: if inserting the
-- profile row ever fails, the auth user is still created instead of the whole
-- signup transaction failing with a 500 "Database error saving new user".
-- (This does NOT fix SMTP errors — a 500 "Error sending confirmation email"
-- comes from your email provider; see README → Confirmation & recovery emails.)
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
exception
  when others then
    return new;
end;
$$;
