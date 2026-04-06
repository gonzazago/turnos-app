# Plan: Fix UI Bugs and Profile Update

## Background & Motivation
El usuario reportó tres problemas:
1. Al agendar una cita, el hover de los botones de horario es blanco sobre blanco, lo que no permite visualizar bien la hora seleccionable.
2. El ícono de Mercado Pago en la sección de configuración tiene una URL rota y no carga.
3. Al intentar actualizar el perfil (por ejemplo, cambiar el color), arroja un error de que el usuario ya existe. Esto se debe a que se está intentando hacer un `UPDATE` sobre un registro que quizás aún no existe, o que la base de datos requiere un `UPSERT` (equivalente a PUT) para manejar tanto la creación inicial del perfil como sus actualizaciones posteriores.

## Proposed Solution
1. **Fix Hover en Horarios (`BookingClient.tsx`)**: Reemplazar las clases personalizadas `hover:brand-bg brand-hover-bg` por clases de Tailwind nativas como `hover:bg-blue-600 hover:text-white` para garantizar un contraste correcto.
2. **Fix Ícono Mercado Pago (`SettingsClient.tsx`)**: Actualizar la URL de la imagen del logo de Mercado Pago a una versión estable y oficial (e.g., SVG de Mercado Pago).
3. **Fix Actualización de Perfil (`actions.ts`)**: Cambiar la llamada `.update()` de Supabase a un `.upsert({ id: user.id, ...updates })`. Esto asegura que si el perfil no existía (primera vez que el usuario entra), se cree, y si ya existía, se actualice sin arrojar errores de restricción o de filas no afectadas.

## Implementation Steps
- [ ] Editar `src/app/[slug]/[eventId]/BookingClient.tsx` para arreglar el `className` del botón de horarios.
- [ ] Editar `src/app/dashboard/settings/SettingsClient.tsx` para arreglar el `src` del `img` tag de Mercado Pago.
- [ ] Editar `src/app/dashboard/settings/actions.ts` para utilizar `.upsert()` en lugar de `.update()` en la función `updateProfile`.

## Verification
- Navegar a la pantalla de reserva pública y hacer hover sobre un horario para confirmar el contraste.
- Entrar a configuración y ver el logo de MP cargado correctamente.
- Intentar cambiar el color de marca o el slug en el perfil y guardarlo sin errores.