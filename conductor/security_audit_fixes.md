# Plan: Security and Logic Audit Fixes

## Overview
This plan implements the 7 security and logic fixes requested:
1.  **Webhook Signature:** Validate the `x-signature` header in `src/app/api/webhooks/mercadopago/route.ts`.
2.  **CSRF in OAuth:** Implement dynamic `state` generation with secure cookies and a new `authorize` endpoint (`src/app/api/auth/mercadopago/authorize/route.ts`). Update the connection button in `SettingsClient.tsx`.
3.  **Data Leak in Logs:** Remove exposed `access_tokens` from `src/app/[slug]/[eventId]/actions.ts`.
4.  **Idempotency:** The webhook will verify if a booking is already `paid` before processing it.
5.  **Insecure Session:** The OAuth callback will verify the `state` against a secure `HttpOnly` cookie.
6.  **Booking Cleanup:** Provide an SQL script using `pg_cron` to delete/cancel expired `pending_payment` bookings.
7.  **Action Authorization:** Refactor `cancelBooking` and `rescheduleBooking` in `src/app/dashboard/actions.ts` to drop the `supabaseAdmin` client, allowing RLS to enforce ownership.

## Implementation Steps
- [x] Create `src/app/api/auth/mercadopago/authorize/route.ts`.
- [x] Update `src/app/dashboard/settings/SettingsClient.tsx` to link to the new authorize route.
- [x] Rewrite `src/app/api/auth/mercadopago/callback/route.ts` with CSRF validation.
- [x] Rewrite `src/app/api/webhooks/mercadopago/route.ts` with HMAC signature validation and idempotency checks.
- [x] Remove `console.log` data leaks in `src/app/[slug]/[eventId]/actions.ts`.
- [x] Remove `supabaseAdmin` from `src/app/dashboard/actions.ts`.
- [x] Provide the `pg_cron` SQL script to the user.