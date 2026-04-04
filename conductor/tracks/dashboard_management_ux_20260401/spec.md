# Track Specification: Dashboard Management & Mobile UX

## Overview
Improve the dashboard user experience by adding a mobile-responsive navigation menu and a comprehensive view for managing appointments (viewing status, canceling, and rescheduling).

## Functional Requirements
1.  **Mobile Navigation:**
    *   Add a hamburger menu icon to the mobile header in `src/app/dashboard/layout.tsx`.
    *   Implement an off-canvas or dropdown mobile sidebar for accessing "Próximas Citas", "Tipos de Eventos", and "Configuración".
2.  **Appointments Dashboard View:**
    *   Update the main dashboard page (`/dashboard`) to display a list of upcoming appointments.
    *   Group or label appointments by status (`confirmed`, `pending_payment`).
    *   Display relevant details (booker name, email, event type, date, time).
3.  **Appointment Actions:**
    *   **Cancel/Delete:** Allow the owner to cancel an appointment. This should update the status to `cancelled` or delete the record, freeing up the time slot.
    *   **Reschedule (Basic):** Allow the owner to change the date/time of an existing appointment from the dashboard.

## Non-Functional Requirements
*   **UX:** The mobile menu must be smooth and accessible. The appointments list should be easy to read and manage.
*   **Security:** Ensure server actions for canceling/rescheduling verify the user's ownership of the booking.

## Out of Scope
*   Automated email notifications to clients when an appointment is canceled or rescheduled by the owner (this could be a future enhancement).
*   Client-initiated rescheduling (clients doing it themselves from a link).