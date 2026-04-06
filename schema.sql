-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null,
  slug text unique,
  full_name text,
  contact_email text,
  brand_color text default '#3b82f6',
  logo_url text,
  mp_access_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for event types
create table public.event_types (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  duration_mins integer not null default 30,
  description text,
  requires_deposit boolean default false not null,
  total_price numeric(10,2) default 0.00 not null,
  deposit_percentage numeric(5,2) default 0.00 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.event_types enable row level security;

create policy "Event types are viewable by everyone."
  on event_types for select
  using ( true );

create policy "Users can insert their own event types."
  on event_types for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own event types."
  on event_types for update
  using ( auth.uid() = user_id );

create policy "Users can delete own event types."
  on event_types for delete
  using ( auth.uid() = user_id );


-- Create a table for bookings
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_type_id uuid references public.event_types(id) on delete cascade not null,
  booker_name text not null,
  booker_email text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'confirmed' not null,
  payment_status text default 'pending' not null,
  mercado_pago_preference_id text,
  billing_info jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

create policy "Bookings are viewable by the event owner."
  on bookings for select
  using ( auth.uid() = user_id );

-- Allow anyone to create a booking
create policy "Anyone can insert a booking"
  on bookings for insert
  with check ( true );

create policy "Users can update own bookings."
  on bookings for update
  using ( auth.uid() = user_id );

create policy "Users can delete own bookings."
  on bookings for delete
  using ( auth.uid() = user_id );

-- Enable btree_gist extension for exclusion constraints
create extension if not exists btree_gist;

-- Ensure no overlapping bookings for the same user
alter table public.bookings add constraint exclude_overlapping_bookings
exclude using gist (
  user_id with =,
  tstzrange(start_time, end_time) with &&
);

-- Create a table for availability
create table public.availability (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_type_id uuid references public.event_types(id) on delete cascade, -- Optional: if null, it's global availability
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure no overlapping availability for the same day and event type
  unique (user_id, event_type_id, day_of_week, start_time)
);

alter table public.availability enable row level security;

create policy "Availability is viewable by everyone."
  on availability for select
  using ( true );

create policy "Users can manage their own availability."
  on availability for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- Set up Storage for Logos
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict do nothing;

create policy "Logos are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'logos' );

create policy "Users can upload their own logos."
  on storage.objects for insert
  with check ( bucket_id = 'logos' and auth.uid() = owner );

create policy "Users can update their own logos."
  on storage.objects for update
  using ( bucket_id = 'logos' and auth.uid() = owner );

create policy "Users can delete their own logos."
  on storage.objects for delete
  using ( bucket_id = 'logos' and auth.uid() = owner );

-- Create a table for payment accounts
create table public.payment_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null,
  provider_user_id text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamp with time zone,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Evita duplicados por cuenta externa
  constraint payment_accounts_unique_account
    unique (provider, provider_user_id)
);

create index if not exists idx_payment_accounts_user_id
  on public.payment_accounts(user_id);

create index if not exists idx_payment_accounts_provider
  on public.payment_accounts(provider);

-- Solo una cuenta activa por usuario + provider
create unique index if not exists idx_payment_accounts_one_active_per_provider
  on public.payment_accounts(user_id, provider)
  where is_active = true;

-- Updated_at automático
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_payment_accounts_updated_at
before update on public.payment_accounts
for each row
execute function public.set_updated_at();

create trigger set_bookings_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

alter table public.payment_accounts enable row level security;

create policy "Users can view their own payment accounts"
  on payment_accounts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own payment accounts"
  on payment_accounts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own payment accounts"
  on payment_accounts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own payment accounts"
  on payment_accounts for delete
  using ( auth.uid() = user_id );

-- Create a table for Google Calendar tokens
create table public.google_calendar_tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  webhook_id text,
  webhook_resource_id text,
  webhook_expiration timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint google_calendar_tokens_user_id_key unique (user_id)
);

alter table public.google_calendar_tokens enable row level security;

create policy "Users can view their own google tokens"
  on google_calendar_tokens for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own google tokens"
  on google_calendar_tokens for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own google tokens"
  on google_calendar_tokens for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own google tokens"
  on google_calendar_tokens for delete
  using ( auth.uid() = user_id );

create trigger set_google_calendar_tokens_updated_at
before update on public.google_calendar_tokens
for each row
execute function public.set_updated_at();
