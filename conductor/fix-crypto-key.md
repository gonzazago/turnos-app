# Plan: Fix Crypto Key Length Error

## Background & Motivation
El usuario reportó un error `ERR_CRYPTO_INVALID_KEYLEN` al intentar encriptar el token en la función `saveAccount`. Este error es lanzado nativamente por el módulo `crypto` de Node.js cuando se intenta crear un cifrador `aes-256-gcm` con una llave que no tiene exactamente 32 bytes de longitud. 

Aunque el código actual espera una cadena hexadecimal de 64 caracteres en el `.env` y comprueba la longitud con `if (key.length !== 32)`, esto resulta frágil frente a ciertos formatos de cadena, interpretaciones de Next.js y posibles variables en el entorno del usuario que saltan la validación pero fallan en `crypto.createCipheriv`.

## Proposed Solution
Vamos a hacer que la generación de la llave sea a prueba de fallos y soporte **cualquier longitud de string** que el usuario configure en `PAYMENT_ENCRYPTION_KEY`.
En lugar de depender de que el usuario provea exactamente un hexadecimal de 32 bytes, usaremos la función nativa `crypto.scryptSync(secret, salt, 32)` para derivar de forma segura y criptográfica una llave de exactamente 32 bytes a partir de cualquier secreto proporcionado en el `.env`.

## Implementation Steps
- [ ] Modificar `src/utils/crypto.ts` y cambiar la función `getEncryptionKey()`.
- [ ] Reemplazar la conversión directa de `Buffer.from(hex)` por `crypto.scryptSync(process.env.PAYMENT_ENCRYPTION_KEY, 'turnos-app-static-salt', 32)`.
- [ ] Esto eliminará la necesidad de lanzar errores molestos sobre la longitud exacta, ya que cualquier clave proporcionada será procesada y normalizada a 32 bytes para ser validada por `aes-256-gcm`.

## Verification
- Al conectar Mercado Pago nuevamente y disparar la función `saveAccount`, la encriptación pasará sin problemas independientemente de si la llave secreta tiene 10 o 100 caracteres en el archivo `.env`.