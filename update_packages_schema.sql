-- Add new columns to session_packages
ALTER TABLE public.session_packages 
ADD COLUMN frequency_per_week integer DEFAULT 1,
ADD COLUMN allowed_days integer[] DEFAULT '{}',
ADD COLUMN variants jsonb DEFAULT '[]'::jsonb;

-- Make old columns nullable since they are now replaced by variants
ALTER TABLE public.session_packages 
ALTER COLUMN session_count DROP NOT NULL,
ALTER COLUMN total_price DROP NOT NULL;

-- Update bookings table to include package_group_id to block slots properly
ALTER TABLE public.bookings 
ADD COLUMN package_group_id uuid;

COMMENT ON COLUMN public.bookings.package_group_id IS 'Used to group bookings created together as part of a session package purchase';
