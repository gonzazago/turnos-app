# Plan: Fix Failing Tests after Refactoring

## Background & Motivation
El usuario notó que el test `should successfully update profile with Mercado Pago credentials` en `src/app/dashboard/settings/actions.test.ts` estaba fallando. Esto se debe a que, en pasos anteriores, refactorizamos la acción `updateProfile` para que ya no actualice ni reciba `mp_access_token`, ya que ahora los tokens de Mercado Pago se gestionan de manera segura en su propia tabla (`payment_accounts`) y a través del `PaymentService`. El test seguía esperando que se pasara este campo obsoleto.

## Proposed Solution
Actualizar el caso de prueba para reflejar la realidad actual de la aplicación: la función `updateProfile` solo debe actualizar detalles públicos del perfil (`full_name`, `slug`, `brand_color`, y el logo). Eliminaremos cualquier referencia o expectativa relacionada con `mp_access_token` en ese test específico.

## Implementation Steps
- [ ] Editar `src/app/dashboard/settings/actions.test.ts`.
- [ ] Renombrar el test a `should successfully update profile details`.
- [ ] Eliminar el mock del `FormData` que añade `mpAccessToken`.
- [ ] Actualizar el `expect(mockSupabase.update).toHaveBeenCalledWith` para que compruebe únicamente los campos esperados (`full_name`, `slug`, `brand_color`).

## Verification
- Ejecutar la suite de pruebas (`npm run test`) para confirmar que el test pasa exitosamente y que toda la suite está en verde.