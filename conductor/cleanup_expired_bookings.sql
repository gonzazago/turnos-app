-- SQL Script to clean up expired bookings that are stuck in 'pending_payment' status.
-- This script uses pg_cron, which can be enabled in Supabase Extensions.

-- 1. Create a function to perform the cleanup
create or replace function public.cleanup_expired_bookings()
returns void as $$
begin
  -- Delete bookings that are pending payment and more than 1 hour old
  -- (Mercado Pago preferences usually expire or are abandoned by then)
  delete from public.bookings
  where status = 'pending_payment'
    and created_at < (now() - interval '1 hour');
    
  -- Also delete bookings that are pending payment and their start time has already passed
  delete from public.bookings
  where status = 'pending_payment'
    and start_time < now();

  -- Optional: Log the cleanup if you have a logs table
  -- insert into public.system_logs (event, message) values ('cleanup', 'Expired bookings deleted');
end;
$$ language plpgsql security definer;

-- 2. Schedule the cleanup using pg_cron
-- This schedules the function to run every hour at minute 0.
-- Make sure to enable the pg_cron extension in your Supabase Dashboard first.
select cron.schedule(
  'cleanup-expired-bookings-task',
  '0 * * * *', -- cron format: min hour day month day-of-week
  'select public.cleanup_expired_bookings()'
);

-- To run it manually for testing:
-- select public.cleanup_expired_bookings();
