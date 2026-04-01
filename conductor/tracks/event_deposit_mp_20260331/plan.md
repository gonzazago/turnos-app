# Implementation Plan: Payment Accounts Integration (Mercado Pago OAuth)

## Phase 1: Payment Accounts Schema
- [x] Task: Create `payment_accounts` table
    - [x] Add `schema.sql` migration for `payment_accounts` with columns: `id`, `user_id`, `provider`, `provider_user_id`, `access_token`, `refresh_token`, `expires_at`, `is_active`, `created_at`, `updated_at`.
    - [x] Add indexes for `user_id`, `provider`.
    - [x] Add unique constraint on `(user_id, provider, provider_user_id)`.
    - [x] Apply RLS policies to ensure users can only access their own payment accounts.
    - [x] Revert previous changes to `profiles` (remove `mp_access_token`).
- [x] Task: Create TypeScript models and repository interface
    - [x] Define `PaymentAccount` interface.
    - [x] Implement `PaymentAccountService` with methods: `saveAccount`, `getActiveAccount`, `refreshTokenIfNeeded`.
- [ ] Task: Conductor - User Manual Verification 'Payment Accounts Schema' (Protocol in workflow.md)

## Phase 2: Mercado Pago OAuth Flow
- [ ] Task: Initiate OAuth
    - [ ] Update Dashboard Settings UI to include a "Connect Mercado Pago" button instead of manual token inputs.
    - [ ] The button should redirect the user to the Mercado Pago OAuth authorization URL with the correct `client_id` and `redirect_uri`.
- [ ] Task: Handle OAuth Callback
    - [ ] Create an API route (e.g., `/api/auth/mercadopago/callback`) to receive the authorization `code`.
    - [ ] Exchange the `code` for an `access_token` and `refresh_token` using the Mercado Pago API.
    - [ ] Use `PaymentAccountService.saveAccount` to persist the credentials to the database.
    - [ ] Redirect the user back to the dashboard settings with a success message.
- [ ] Task: Conductor - User Manual Verification 'Mercado Pago OAuth Flow' (Protocol in workflow.md)

## Phase 3: Token Management and Refresh Logic
- [ ] Task: Implement token refresh logic
    - [ ] Complete the `refreshTokenIfNeeded` method in `PaymentAccountService`.
    - [ ] When called, check if `expires_at` is in the past (or within a 5-minute buffer).
    - [ ] If expired, call Mercado Pago API to refresh the token, update the database, and return the new token.
- [ ] Task: Conductor - User Manual Verification 'Token Management and Refresh Logic' (Protocol in workflow.md)

## Phase 4: Integration with Booking Flow
- [ ] Task: Create Preference with dynamic token
    - [ ] Update the `createBooking` action (or the payment initiation step).
    - [ ] Fetch the owner's active Mercado Pago account via `PaymentAccountService.getActiveAccount(ownerId, 'mercadopago')`.
    - [ ] Refresh the token if necessary using the service.
    - [ ] Use the valid `access_token` to create the Mercado Pago preference.
    - [ ] Return the `init_point` to the client for checkout.
- [ ] Task: Conductor - User Manual Verification 'Integration with Booking Flow' (Protocol in workflow.md)
