# Plan: Implement Encryption Layer for Payment Tokens

## Background & Motivation
Actualmente, los tokens de acceso (`access_token`) y de actualización (`refresh_token`) de Mercado Pago se almacenan en texto plano en la tabla `payment_accounts` de la base de datos. Como medida de seguridad adicional y para cumplir con las mejores prácticas (y posibles auditorías), es necesario cifrar esta información sensible en reposo.

## Proposed Solution
Crear una utilidad criptográfica basada en el módulo `crypto` nativo de Node.js (utilizando un algoritmo robusto como `aes-256-gcm`) para cifrar y descifrar los tokens transparentemente dentro de nuestro `PaymentService`.

## Key Files & Context
- `src/utils/crypto.ts`: Nuevo archivo con las funciones `encryptToken` y `decryptToken`.
- `src/services/payment/service.ts`: Único lugar responsable de leer y escribir en la tabla `payment_accounts`. Aquí se interceptarán los datos para cifrarlos antes del `upsert` y descifrarlos después del `select`.
- `.env.local` / Environment: Se requerirá una nueva variable de entorno (por ejemplo, `PAYMENT_ENCRYPTION_KEY`) de 32 bytes en formato hexadecimal.

## Implementation Steps
1. **Crear `src/utils/crypto.ts`:**
   - Implementar el algoritmo `aes-256-gcm` con un vector de inicialización (IV) único por cada cifrado.
   - El formato guardado será `iv:authTag:encryptedData` para permitir un descifrado seguro.

2. **Integrar en `PaymentService`:**
   - En `saveAccount()`: Encriptar `access_token` y `refresh_token` antes de enviarlos a Supabase.
   - En `getActiveAccount()` y `getAccountByProviderId()`: Descifrar estos campos inmediatamente después de recibirlos de la base de datos y antes de devolver el objeto.
   - Manejar correctamente valores nulos u opcionales (e.g. si `refresh_token` no existe).

3. **Variables de Entorno:**
   - Generar y documentar la necesidad de la variable `PAYMENT_ENCRYPTION_KEY`.

## Verification & Testing
- Los nuevos tokens insertados en la base de datos deben verse como cadenas hexadecimales ilegibles (con el formato `iv:authTag:encryptedData`).
- El flujo de pago de Mercado Pago, la renovación automática (refresh) y los webhooks deben seguir funcionando sin problemas de descifrado, probando que la capa es completamente transparente.