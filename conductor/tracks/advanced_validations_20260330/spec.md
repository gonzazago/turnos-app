# Track Specification: Advanced Validations, Config, and Payment Prep

## Overview
This track introduces advanced booking validations, enhanced configuration options for calendar owners, a new UI for viewing booking details, and database schema updates to prepare for future payment gateway integrations.

## Functional Requirements
1.  **Booking Validations (Rate Limiting):**
    *   Enforce a limit of one booking per day for the same **email address** (from the booking form), for a specific event type or provider.
    *   This validation must occur at the server level (Supabase RPC or Server Action) to prevent abuse.
2.  **Owner Configuration (Availability):**
    *   Owners must be able to configure global working hours and per-day specific working hours.
    *   A Dashboard UI must be provided to allow owners to manage these availability settings easily.
    *   The booking client must respect these new configurations when generating available slots.
3.  **Booking Details UI:**
    *   When an owner clicks on a scheduled appointment in their dashboard calendar, a Modal Pop-up must appear displaying the full details of the booker and the event.
4.  **Payment Preparation:**
    *   Update the `event_types` schema to include:
        *   A boolean flag indicating if a deposit/payment is required.
        *   Fields for the total price and the deposit amount.
    *   Update the booking flow to collect necessary billing information (e.g., billing address, phone number) if the "require deposit" flag is set, storing this data for future processing.

## Non-Functional Requirements
*   **Security:** Ensure RLS policies correctly restrict access to the new billing information and payment flags.
*   **UX:** The Modal Pop-up must be responsive and accessible.
*   **Performance:** The validation logic for checking existing daily bookings must be optimized (e.g., using database indexes on the `bookings` table for `booker_email` and `start_time`).

## Acceptance Criteria
*   An email address cannot be used to book two slots on the exact same calendar day for the same provider.
*   The calendar owner can successfully set their working hours in the dashboard, and these changes immediately reflect on their public booking page.
*   Clicking a booking in the dashboard opens a functional modal with all relevant details.
*   Event types can be configured to require a deposit, including setting the price and deposit amounts.
*   The booking flow successfully collects and saves billing info when an event requires a deposit.

## Out of Scope
*   Actual integration with Stripe, PayPal, or any other payment processor.
*   Processing actual transactions or handling credit card data.
