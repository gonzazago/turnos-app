import crypto from 'crypto';

const CANCEL_SECRET = process.env.CANCEL_TOKEN_SECRET || 'default-cancel-secret-do-not-use-in-prod';

/**
 * Generates a secure, signed cancellation token for a booking.
 * 
 * @param bookingId - The ID of the booking
 * @returns A base64 encoded signed token
 */
export function generateCancelToken(bookingId: string = ''): string {
  const data = JSON.stringify({
    bookingId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  });

  const signature = crypto
    .createHmac('sha256', CANCEL_SECRET)
    .update(data)
    .digest('hex');

  return Buffer.from(JSON.stringify({ data, signature })).toString('base64');
}

/**
 * Verifies a signed cancellation token.
 * 
 * @param token - The base64 encoded token
 * @param bookingId - The expected booking ID
 * @returns true if the token is valid and matches the bookingId
 */
export function verifyCancelToken(token: string, bookingId: string): boolean {
  try {
    const { data, signature } = JSON.parse(Buffer.from(token, 'base64').toString());
    
    const expectedSignature = crypto
      .createHmac('sha256', CANCEL_SECRET)
      .update(data)
      .digest('hex');

    if (signature !== expectedSignature) {
      return false;
    }

    const payload = JSON.parse(data);
    
    if (payload.bookingId !== bookingId) {
      return false;
    }

    // Optional: add expiration logic (e.g., 7 days)
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.timestamp > sevenDaysInMs) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}
