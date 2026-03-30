-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null,
  slug text unique,
  full_name text,
  brand_color text default '#3b82f6',
  logo_url text,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
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

-- Create a table for availability
create table public.availability (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure no overlapping availability for the same day
  unique (user_id, day_of_week, start_time)
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
