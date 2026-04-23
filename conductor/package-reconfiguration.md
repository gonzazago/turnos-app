# Implementation Plan: Reconfigure Session Packages (Fijo & Variantes)

## Objective
Mejorar la configuración de los Paquetes de Sesiones para permitir dos nuevas funcionalidades clave:
1. **Configuración de Variantes**: El profesional podrá definir múltiples variantes de cantidad de sesiones y precios en una sola carga (ej. 10 sesiones por $10.000, 20 sesiones por $18.000).
2. **Agendamiento Fijo Avanzado**: Para paquetes recurrentes (fijos), el profesional podrá especificar la frecuencia semanal y los días habilitados (ej. 3 veces por semana los Lunes, Miércoles y Viernes). Al comprar, el sistema calculará todas las fechas automáticamente y bloqueará los slots de inmediato.

## Key Files & Context
- `schema.sql`: Actualización de la tabla `session_packages`.
- `src/app/dashboard/packages/PackageForm.tsx`: Interfaz del profesional para configurar variantes, frecuencia y días.
- `src/app/dashboard/packages/actions.ts`: Lógica del servidor para guardar el paquete con sus variantes.
- `src/app/[slug]/package/[packageId]/PackageClient.tsx`: Interfaz del cliente para seleccionar la variante, elegir la fecha inicial (filtrada por días habilitados) y ver la previsualización de todos los turnos.
- `src/app/[slug]/package/[packageId]/actions.ts`: Lógica de compra que pre-inserta las reservas en estado `pending_payment` para bloquear los slots al instante.
- `src/app/api/webhooks/mercadopago/route.ts`: Webhook que confirma las reservas generadas al aprobarse el pago.

## Implementation Steps

### 1. Database Schema Update
- Modificar la tabla `session_packages`:
  - Agregar columna `frequency_per_week` (integer, por defecto 1).
  - Agregar columna `allowed_days` (integer array, ej. `[1, 3, 5]` para Lu, Mi, Vi).
  - Agregar columna `variants` (jsonb, por defecto `[]::jsonb`) para almacenar un arreglo de objetos: `[{ "id": "v1", "session_count": 10, "price": 10000 }, ...]`.
  - Hacer que las columnas existentes `session_count` y `total_price` sean nullables, ya que ahora dependerán de las variantes (o mantenerlas para retrocompatibilidad apuntando a la primera variante).

### 2. Owner Configuration (`PackageForm.tsx` & `actions.ts`)
- En `PackageForm.tsx`:
  - Cambiar los campos estáticos de sesiones y precio por un generador dinámico de variantes (ej. botones para agregar opción de 10, 20, 30 sesiones con sus respectivos precios).
  - Si se selecciona "Agendamiento Recurrente (Fijo)", mostrar:
    - "Sesiones por semana" (ej. 3).
    - "Días habilitados" (Checkboxes para L, M, M, J, V, S, D).
- En `actions.ts`, procesar el JSON de variantes, la frecuencia y los días habilitados para guardarlos en Supabase.

### 3. Date Calculation Logic
- Crear una función utilitaria `calculatePackageDates(startDate, sessionCount, allowedDays, frequencyPerWeek)`.
  - A partir del `startDate`, encontrar iterativamente las siguientes fechas que coincidan con los `allowedDays` hasta completar el `sessionCount`.
  - Mantener la hora exacta del `startDate` para todas las sesiones subsecuentes.

### 4. Client Booking UI (`PackageClient.tsx`)
- Paso 1: El cliente selecciona una de las variantes del paquete (ej. "Paquete de 20 sesiones - $18.000").
- Paso 2: Si el paquete es "Fijo", el cliente elige la fecha de inicio. Las fechas seleccionables en el calendario estarán restringidas a los `allowed_days`.
- Paso 3: Una vez seleccionada la fecha y hora inicial, se usa `calculatePackageDates` para mostrar una lista de previsualización ("Se reservarán 20 turnos: Lunes 10 15:00, Miércoles 12 15:00...").

### 5. Immediate Slot Blocking (`[packageId]/actions.ts`)
- En el proceso de compra, calcular las fechas en el servidor usando `calculatePackageDates`.
- Generar un identificador único para el grupo de reservas (`package_booking_group_id`, ej. usando `crypto.randomUUID()`).
- Pre-insertar todas las reservas en la tabla `bookings` con estado `pending_payment`.
- Pasar el `package_booking_group_id` a Mercado Pago a través del `external_reference`.

### 6. Payment Confirmation (`webhooks/mercadopago/route.ts`)
- Actualizar la lógica del webhook para `PKGFIJO`.
- Extraer el `package_booking_group_id` desde `external_reference`.
- Actualizar todas las reservas que coincidan con este ID a estado `confirmed` y `payment_status = 'paid'`.

## Verification
- Crear un paquete con 3 variantes (10, 20 y 30 sesiones) configurado para 3 veces por semana los Lunes, Miércoles y Viernes.
- Verificar que el formulario se guarde correctamente en la base de datos con el JSON de variantes.
- Entrar a la vista del cliente para comprar el paquete.
- Seleccionar la variante de 20 sesiones.
- Elegir un Lunes a las 10:00 AM como inicio.
- Verificar que la previsualización muestre exactamente 20 fechas distribuidas en Lu, Mi, Vi.
- Proceder al pago, verificar que las 20 reservas se hayan creado en la DB como `pending_payment`.
- Simular la aprobación del webhook y verificar que las 20 reservas pasen a `confirmed`.