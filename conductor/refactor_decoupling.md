# Plan: Decoupling and Architecture Refactoring

## Background & Motivation
Actualmente, la lógica de negocio (especialmente la de Mercado Pago y la gestión de reservas) está distribuida directamente en los `Server Actions`, `Route Handlers` y componentes. Esto dificulta el mantenimiento, la realización de pruebas unitarias y, sobre todo, una futura migración a una API backend independiente. El objetivo es centralizar esta lógica en servicios desacoplados mediante interfaces.

## Proposed Solution
1. **Infraestructura de Pagos:**
   - Definir una interfaz `PaymentProvider` para estandarizar operaciones como la creación de pagos (preferencias), validación de webhooks y manejo de tokens.
   - Implementar `MercadoPagoProvider` siguiendo esta interfaz.
   - Crear un `PaymentService` que actúe como orquestador.

2. **Servicio de Reservas:**
   - Crear un `BookingService` que centralice todas las operaciones de la tabla `bookings` (crear, cancelar, reprogramar, obtener detalles).
   - Este servicio será el único lugar donde se interactúe con el cliente de Supabase para esta entidad.

3. **Refactorización de Lógica Distribuida:**
   - Mover la lógica de validación de disponibilidad y rate limiting de los componentes/actions al `BookingService`.
   - Reemplazar las llamadas directas a `fetch` de Mercado Pago por llamadas al `PaymentService`.

## Key Files & Context
- `src/services/payment/provider.ts`: Interfaz del proveedor.
- `src/services/payment/mercadopago.ts`: Implementación de Mercado Pago.
- `src/services/booking/service.ts`: Servicio centralizado de reservas.
- `src/app/[slug]/[eventId]/actions.ts`: Se simplificará delegando en los servicios.
- `src/app/api/webhooks/mercadopago/route.ts`: Usará el servicio para validar la firma e idempotencia.

## Implementation Plan

### Phase 1: Payment Abstraction
- [ ] Definir `PaymentProvider` interface.
- [ ] Implementar `MercadoPagoProvider` (extrayendo lógica de `actions.ts` y `payment-accounts.ts`).
- [ ] Crear factory/service para manejar proveedores.

### Phase 2: Booking Service
- [ ] Crear `BookingService` con métodos: `create`, `cancel`, `reschedule`, `getById`, `getByUser`.
- [ ] Integrar validaciones de disponibilidad dentro del `BookingService`.

### Phase 3: Refactoring & Integration
- [ ] Refactorizar `src/app/[slug]/[eventId]/actions.ts` para usar los nuevos servicios.
- [ ] Refactorizar `src/app/dashboard/actions.ts` para usar `BookingService`.
- [ ] Refactorizar webhooks y callbacks de OAuth.

## Verification
- Ejecutar suite de tests existente.
- Crear nuevos tests unitarios para `BookingService` y `MercadoPagoProvider`.
- Verificar manualmente el flujo completo de reserva y pago.
