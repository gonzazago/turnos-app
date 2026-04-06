# Plan: Optimization of Supabase Admin Client

## Background & Motivation
Actualmente, la aplicación instancia el cliente `supabaseAdmin` en múltiples archivos de forma separada utilizando `createClient` de `@supabase/supabase-js` (e.g. en `actions.ts`, `payment-accounts.ts`, `route.ts` de webhooks y la página de `status`). Esto puede llevar a un alto consumo de memoria y al agotamiento de las conexiones con la base de datos debido a la creación excesiva de clientes, especialmente en entornos serverless como Next.js donde el contexto de ejecución se mantiene entre invocaciones o se recrea frecuentemente, por lo que es preferible inicializar el cliente de base de datos una sola vez globalmente y reusarlo.

## Proposed Solution
Crear un archivo utilitario centralizado `src/utils/supabase/admin.ts` que exporte una única instancia del cliente administrador de Supabase (patrón Singleton). Además de evitar el recreado innecesario del cliente en modo serverless, reutilizaremos la conexión a lo largo de las peticiones.

## Implementation Steps
1. **Crear `src/utils/supabase/admin.ts`:**
   - Implementar el patrón Singleton usando un objeto `globalThis` en desarrollo para evitar crear múltiples clientes por HMR (Hot Module Replacement), y una simple instancia global en producción.
   - Proveer la función `getSupabaseAdmin()` o simplemente exportar `supabaseAdmin`.

2. **Refactorizar usos actuales:**
   - **`src/utils/payment-accounts.ts`:** Reemplazar las instancias locales de `createClient` por la instancia importada.
   - **`src/app/[slug]/[eventId]/actions.ts`:** Importar la instancia central en la función `createBooking`.
   - **`src/app/api/webhooks/mercadopago/route.ts`:** Usar el singleton en lugar de inicializar `createClient` por cada webhook.
   - **`src/app/[slug]/[eventId]/status/page.tsx`:** Refactorizar la obtención del admin client si es requerido para actualizar el booking.

## Verification
- Ejecutar los tests (o correr `npm run dev`) para asegurar que todo compila y que la inicialización funciona de la misma manera pero empleando solo una instancia.