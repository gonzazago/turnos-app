# Overview
Mejorar la landing page actual (home) para que funcione como un "funnel" (embudo de conversión) más efectivo. El objetivo principal es reducir la fricción para que los nuevos usuarios se registren, invitándolos a reclamar su enlace personalizado desde el primer instante.

# Functional Requirements
- **Hero Section (Funnel Principal):** Reemplazar el botón genérico por un campo interactivo donde el usuario escriba su nombre (ej. `turnos.app/[juan]`) y un botón "Reclamar enlace" que redirija a la página de registro `/register` pasando el slug como parámetro (ej. `?slug=juan`).
- **Sección de Beneficios Clave:** Destacar las integraciones de la app como Sincronización con Google Calendar, Cobro de señas por Mercado Pago y múltiples tipos de eventos.
- **Sección Cómo Funciona:** Explicar el flujo en 3 pasos simples (1. Crea tu página, 2. Comparte tu enlace, 3. Recibe reservas automáticamente).
- **Prueba Social:** Añadir logos de empresas, industrias o testimonios de prueba para generar confianza en el producto.
- **Navegación Sticky:** Asegurar que el Header principal (con el botón "Crear cuenta gratis" / "Iniciar sesión") se mantenga fijo al hacer scroll en la página para no perder el llamado a la acción.

# Acceptance Criteria
- [ ] El Hero incluye un input funcional que captura el slug y redirige a `/register?slug=...` al hacer clic.
- [ ] La página de registro lee opcionalmente el parámetro `slug` de la URL para pre-rellenar o asegurar el slug (si la funcionalidad actual lo permite, en `signup` se autogenera; se debe adaptar para usar el provisto si existe).
- [ ] El diseño es mobile-first y mantiene coherencia con la marca de Turnos App.
- [ ] Las secciones de Beneficios, Cómo Funciona y Prueba Social están implementadas con UI limpia y componentes de `lucide-react`.
- [ ] El header utiliza `sticky` o `fixed` para estar siempre visible con un CTA prominente.

# Out of Scope
- Analíticas avanzadas de conversión.
- Modificación del backend o estructura de la base de datos (solo modificaciones de frontend).