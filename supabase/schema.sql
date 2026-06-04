-- Financial Budget Management schema
-- Chạy file này trong Supabase SQL Editor trước khi chạy app.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  full_name text not null default '',
  email text not null unique,
  avatar_url text,
  currency text not null default 'VND',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  theme text not null default 'light',
  role text not null default 'user',
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null,
  income numeric(14,2) not null default 0,
  total_allocated numeric(14,2) not null default 0,
  total_spent numeric(14,2) not null default 0,
  closing_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month, year)
);

create table if not exists public.buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#16a34a',
  icon text not null default 'Wallet',
  allocated_amount numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  target_amount numeric(14,2) not null default 0,
  is_rollover boolean not null default true,
  calculation_mode text not null default 'end_of_day' check (calculation_mode in ('realtime','end_of_day','manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bucket_id uuid references public.buckets(id) on delete set null,
  type text not null check (type in ('expense','income','transfer_in','transfer_out','adjustment')),
  amount numeric(14,2) not null check (amount >= 0),
  category text not null default 'Khác',
  note text,
  receipt_url text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  target text not null,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create or replace function public.ensure_default_monthly_bucket()
returns trigger
language plpgsql
as $$
begin
  insert into public.buckets (
    user_id,
    name,
    description,
    color,
    icon,
    allocated_amount,
    current_balance,
    target_amount,
    is_rollover,
    calculation_mode
  )
  select
    new.id,
    'Chi tiêu tháng',
    'Hũ mặc định để theo dõi chi tiêu sinh hoạt theo ngày trong tháng.',
    '#0f766e',
    'Wallet',
    0,
    0,
    0,
    false,
    'realtime'
  where not exists (
    select 1
    from public.buckets b
    where b.user_id = new.id and b.name = 'Chi tiêu tháng'
  );

  return new;
end;
$$;

drop trigger if exists trg_profiles_default_monthly_bucket on public.profiles;

create trigger trg_profiles_default_monthly_bucket
after insert on public.profiles
for each row
execute function public.ensure_default_monthly_bucket();

insert into public.buckets (
  user_id,
  name,
  description,
  color,
  icon,
  allocated_amount,
  current_balance,
  target_amount,
  is_rollover,
  calculation_mode
)
select
  p.id,
  'Chi tiêu tháng',
  'Hũ mặc định để theo dõi chi tiêu sinh hoạt theo ngày trong tháng.',
  '#0f766e',
  'Wallet',
  0,
  0,
  0,
  false,
  'realtime'
from public.profiles p
where not exists (
  select 1
  from public.buckets b
  where b.user_id = p.id and b.name = 'Chi tiêu tháng'
);

create index if not exists idx_buckets_user_id on public.buckets(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_occurred_at on public.transactions(occurred_at desc);
create index if not exists idx_audit_actor_id on public.audit_logs(actor_id);
