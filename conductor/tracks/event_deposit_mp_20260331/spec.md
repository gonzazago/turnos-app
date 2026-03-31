# Track Specification: Event Deposit and Mercado Pago Integration

## Overview
Enable calendar owners to configure if an event type requires a deposit (seña). If enabled, the client must be notified during the booking flow, and the process must integrate with Mercado Pago for payment.

## Functional Requirements
1.  **Event Configuration (Owner Dashboard):**
    *   Add a toggle to "Require Deposit" when creating or editing an event type.
    *   If enabled, allow setting a "Total Price" and a "Deposit Percentage" (e.g., 20% of total).
    *   Automatically calculate and display the deposit amount in the dashboard UI for clarity.
2.  **Booking Flow (Public Page):**
    *   **Slot Selection:** Display a "Requires Deposit" badge or notice.
    *   **Confirmation Form:** Clearly show the Total Price and the Deposit Amount to be paid now.
    *   **Booking Creation:** When "Confirm" is clicked, create the booking with a status of `pending_payment`.
3.  **Mercado Pago Integration:**
    *   Generate a Mercado Pago Preference when a deposit-required booking is initiated.
    *   Redirect the user to the Mercado Pago checkout or open the Pro Checkout overlay.
    *   Implement a Webhook or Webhook-less redirect handler to update the booking status to `confirmed` once payment is successful.
4.  **UI Feedback:**
    *   Display the payment status and deposit details on the booking success screen.

## Non-Functional Requirements
*   **Security:** Securely handle Mercado Pago credentials using environment variables.
*   **Reliability:** Ensure bookings are not confirmed without a successful payment notification.
*   **UX:** Provide a seamless transition between the booking form and the payment gateway.

## Acceptance Criteria
*   Owners can set a percentage-based deposit for any event type.
*   Clients see the deposit requirement at multiple stages of the booking flow.
*   Bookings requiring a deposit are created as `pending_payment`.
*   A successful Mercado Pago transaction updates the booking status to `confirmed`.
*   Clients receive a clear confirmation of both their appointment and their payment.

## Out of Scope
*   Partial refunds or automated cancellations for unpaid 'pending' bookings (manual for now).
*   Integration with other payment gateways (Stripe, etc.).
*   Multiple payment methods within Mercado Pago (standard Pro Checkout features will be used).
