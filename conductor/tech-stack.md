# Technology Stack: Turnos App

## Language
- **TypeScript:** Ensuring type safety and maintainability across the entire codebase.

## Frontend
- **Framework:** Next.js (App Router) using React 19 for modern server-side rendering and efficient client-side updates.
- **Styling:** Tailwind CSS for rapid, utility-first styling and consistent layout management.
- **Component Library:** Built from scratch using Tailwind and Lucide React icons for a tailored experience.

## Backend & Database
- **Supabase:** Providing a full backend-as-a-service, including:
    - **PostgreSQL:** Reliable relational data storage with **Exclusion Constraints** for atomicity and **JSONB** for flexible billing information.
    - **Authentication:** Secure user sign-up and management.
    - **Row Level Security (RLS):** For secure data access at the database level.
    - **Storage:** For handling user-uploaded assets like logos.

## External Integrations
- **Mercado Pago:** For secure payment processing and automated refunds.
- **Google Calendar API:** For bidirectional synchronization of events.
- **Twilio:** For automated WhatsApp notifications (Plan Ultra).

## Core Libraries
- **date-fns:** For powerful and consistent date manipulation and formatting.
- **clsx & tailwind-merge:** For managing conditional class names and preventing Tailwind class conflicts.
- **lucide-react:** A clean and consistent set of SVG icons.

## Testing
- **Vitest:** A fast, Next.js-compatible test runner for unit and integration tests.
- **React Testing Library:** For testing component behavior and accessibility.
