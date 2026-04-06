# Implementation Plan: Landing Page Funnel Improvement

### Phase 1: Header and Hero Funnel (UI)
- [x] Task: Make Header Sticky (aa09c9c)
    - [x] Update `src/app/page.tsx` to ensure the `<header>` element is `fixed` or `sticky`, with a background and shadow on scroll, maintaining the "Crear cuenta" / "Iniciar sesión" CTA.
- [x] Task: Implement Hero Slug Input (54e7fa5)
    - [x] Add an interactive client component (or form) in `src/app/page.tsx` that captures a `slug` string (e.g., `turnos.app/[input]`).
    - [x] Redirect the user to `/register?slug=[input]` upon submission.
- [x] Task: Update Register Action to consume Slug (7a63252)
    - [x] Update `src/app/register/page.tsx` and `src/app/login/actions.ts` to parse the `slug` form field/parameter and use it when creating the profile instead of auto-generating one (checking for uniqueness).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Header and Hero Funnel (UI)' (Protocol in workflow.md)

### Phase 2: Landing Page Sections
- [ ] Task: Add "Prueba Social" Section
    - [ ] Include a simple banner/row with dummy company logos or text emphasizing trust (e.g., "Usado por cientos de profesionales").
- [ ] Task: Add "Cómo Funciona" Section
    - [ ] Implement a 3-step grid (Crea tu perfil, Comparte tu enlace, Recibe reservas) usando iconos de `lucide-react`.
- [ ] Task: Add "Beneficios Clave" Section
    - [ ] Destacar Sincronización con Google Calendar, Cobros con Mercado Pago y recordatorios (usando un diseño limpio a dos columnas o en grilla).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Landing Page Sections' (Protocol in workflow.md)

### Phase 3: Final Touches
- [ ] Task: Bottom CTA and Cleanup
    - [ ] Add a strong, visible "Bottom CTA" section inviting the user to claim their link one last time.
    - [ ] Validate mobile responsiveness and touch target sizes across the entire home page.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Touches' (Protocol in workflow.md)