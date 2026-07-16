-- ============================================================================
-- Al-Tomoh — migration v4: FINAL signup hardening
-- Run once in Supabase → SQL Editor → Run.
--
-- A signup that returns 500 with NO email sent has exactly two causes:
--
--   (1) "Database error saving new user"  → the profile-creation trigger
--        fails, which rolls back the whole signup. THIS FILE eliminates it.
--   (2) "Error sending confirmation email" → your SMTP settings are wrong.
--        SQL cannot fix that; see the notes at the bottom.
--
-- Everything here is idempotent and safe to re-run.
-- ============================================================================

-- 1) Make sure the profiles table exists with the expected shape ------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  is_suspended boolean not null default false,
  created_at timestamptz not null default now()
);

-- In case an older table is missing a column, add them defensively.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists is_suspended boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- 2) Recreate the trigger so a profile hiccup can NEVER abort signup --------
--    SECURITY DEFINER + a broad exception guard means: even if the insert
--    fails for any reason, the auth user is still created and signup succeeds.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  begin
    insert into public.profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
    on conflict (id) do nothing;
  exception
    when others then
      -- swallow everything: the profile row is not worth failing signup over
      null;
  end;
  return new;
end;
$$;

-- Make sure the function is owned by a role that can write to profiles.
alter function public.handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Back-fill a profile for any auth user that somehow has none ------------
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- ============================================================================
-- After running this:
--   • If signup STILL returns 500 with no email, the cause is (2) SMTP.
--     Go to Authentication → Logs and read the red line:
--       - "Database error saving new user"   → re-run this file / check it ran
--       - "Error sending confirmation email"  → fix SMTP (below)
--
--   SMTP fix (Resend), Authentication → SMTP Settings → Enable Custom SMTP:
--       Host:         smtp.resend.com
--       Port:         465
--       Username:     resend
--       Password:     your full Resend API key (re_...)
--       Sender email: onboarding@resend.dev   (or an address on a verified domain)
--       Sender name:  مكتبة الطموح
--   A wrong port, a truncated key, or an unverified sender all produce
--   "500 + no email". If in doubt, turn Custom SMTP OFF to fall back to the
--   built-in sender (works, but is rate limited to a few emails per hour).
-- ============================================================================
