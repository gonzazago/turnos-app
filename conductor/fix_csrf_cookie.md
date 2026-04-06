# Plan: Fix CSRF Cookie Validation in Mercado Pago OAuth

## Background & Motivation
El usuario ha reportado un error `CSRF Validation failed: state mismatch or missing` al intentar conectar su cuenta de Mercado Pago. Esto ocurre porque la cookie `mp_oauth_state` generada en `/api/auth/mercadopago/authorize/route.ts` no se está recuperando correctamente en `/api/auth/mercadopago/callback/route.ts`, o el navegador la está bloqueando debido a las políticas de seguridad (como `sameSite: 'lax'` y el atributo `secure` en localhost sin HTTPS).

## Proposed Solution
1. Simplificar los atributos de la cookie `mp_oauth_state` en el endpoint de autorización para maximizar la compatibilidad, eliminando `sameSite: 'lax'` y `secure: process.env.NODE_ENV === 'production'` de manera que Next.js/navegador utilice los defaults seguros más apropiados para cada entorno (especialmente localhost HTTP vs Vercel HTTPS).
2. Corregir una redundancia en el callback de OAuth donde se aplicaba `(await cookieStore)` tras haber resuelto la promesa con `await cookies()`, y agregar logs para facilitar la depuración (imprimiendo el estado recibido de la URL y el leído de la cookie).

## Implementation Steps
- [ ] Modificar `src/app/api/auth/mercadopago/authorize/route.ts` y cambiar los atributos de la llamada a `cookieStore.set()`.
- [ ] Modificar `src/app/api/auth/mercadopago/callback/route.ts` eliminando los `await` redundantes en la obtención y eliminación de la cookie, e insertando los `console.log`.

## Verification
- Al navegar a la sección de configuración de pagos y hacer clic en "Conectar Mercado Pago", el navegador almacenará correctamente la cookie y el flujo OAuth de redirección debería ser procesado exitosamente.