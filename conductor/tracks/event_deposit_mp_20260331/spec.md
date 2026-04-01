# Track Specification: Payment Accounts Integration (Mercado Pago OAuth)

## Overview
Design and implement a robust `payment_accounts` table to handle 1:N payment provider integrations for users. Initially, this will support Mercado Pago via OAuth, allowing professionals to securely connect their accounts to receive deposits for their bookings, without manually pasting Access Tokens.

## Functional Requirements
1.  **Database:**
    *   Create a `payment_accounts` table decoupled from `profiles` with fields: `id`, `user_id`, `provider` (e.g., 'mercadopago'), `provider_user_id`, `access_token`, `refresh_token`, `expires_at`, `is_active`, `created_at`, `updated_at`.
2.  **Constraints:**
    *   Index by `user_id`.
    *   Index by `provider`.
    *   Unique constraint on `(user_id, provider, provider_user_id)`.
    *   Constraint or logic to ensure only one active account per provider per user.
3.  **Business Logic (Token Management Service):**
    *   A user can connect multiple providers (1:N), but only one active account per provider.
    *   Service to save an account (insert/update).
    *   Service to get the active account by `user_id` and `provider`.
    *   Service to refresh the token if `expires_at` is past or near expiry.
4.  **Mercado Pago OAuth Integration:**
    *   Implement the OAuth redirect flow where users authorize the app to access their Mercado Pago account.
    *   Exchange the authorization code for `access_token`, `refresh_token`, and `expires_at`.
    *   Save these securely in `payment_accounts`.
5.  **Preference Creation:**
    *   Use the dynamically fetched and refreshed `access_token` from the `payment_accounts` table to create payment preferences for event bookings.

## Non-Functional Requirements
*   **Security:** Tokens (`access_token`, `refresh_token`) should be stored securely. They must NEVER be exposed in public API responses.
*   **Extensibility:** The design must allow adding future providers (like Stripe) without modifying the schema structure.
*   **Reliability:** The system must proactively refresh tokens before making calls to the Mercado Pago API if they are expired.

## Acceptance Criteria
*   `payment_accounts` table is created with all specified columns and constraints.
*   Users can initiate the Mercado Pago OAuth flow from their dashboard settings.
*   Upon successful OAuth authorization, a new active record is created or updated in `payment_accounts`.
*   When a client books an event requiring a deposit, the system fetches the active `payment_accounts` for the owner, refreshes the token if needed, and successfully creates a Mercado Pago preference.
