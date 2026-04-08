import { describe, it, expect } from 'vitest';
import { generateCancelToken, verifyCancelToken } from './tokens';

describe('cancellation tokens', () => {
  it('should generate a string token', () => {
    const token = generateCancelToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(32);
  });

  it('should generate different tokens each time', () => {
    const token1 = generateCancelToken();
    const token2 = generateCancelToken();
    expect(token1).not.toBe(token2);
  });

  it('should verify a valid token', () => {
    const bookingId = 'booking-123';
    const token = generateCancelToken(bookingId);
    const isValid = verifyCancelToken(token, bookingId);
    expect(isValid).toBe(true);
  });

  it('should fail verification for wrong bookingId', () => {
    const bookingId = 'booking-123';
    const token = generateCancelToken(bookingId);
    const isValid = verifyCancelToken(token, 'wrong-id');
    expect(isValid).toBe(false);
  });

  it('should fail verification for tampered token', () => {
    const bookingId = 'booking-123';
    const token = generateCancelToken(bookingId);
    
    // Decode, tamper the signature, and re-encode
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    decoded.signature = 'tampered-' + decoded.signature;
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64');
    
    const isValid = verifyCancelToken(tamperedToken, bookingId);
    expect(isValid).toBe(false);
  });
});
