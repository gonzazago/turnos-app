import { describe, it, expect } from 'vitest';
import { calculateRefund } from './refunds';

describe('calculateRefund', () => {
  const rules = [
    { hoursBefore: 24, percentage: 50 },
    { hoursBefore: 48, percentage: 100 }
  ];

  it('should return 100% refund if cancelled more than 48 hours before', () => {
    const appointmentTime = new Date('2026-04-10T10:00:00Z');
    const cancelTime = new Date('2026-04-08T09:00:00Z'); // 49 hours before
    const result = calculateRefund(rules, appointmentTime, cancelTime);
    expect(result.percentage).toBe(100);
  });

  it('should return 50% refund if cancelled between 24 and 48 hours before', () => {
    const appointmentTime = new Date('2026-04-10T10:00:00Z');
    const cancelTime = new Date('2026-04-09T09:00:00Z'); // 25 hours before
    const result = calculateRefund(rules, appointmentTime, cancelTime);
    expect(result.percentage).toBe(50);
  });

  it('should return 0% refund if cancelled less than 24 hours before', () => {
    const appointmentTime = new Date('2026-04-10T10:00:00Z');
    const cancelTime = new Date('2026-04-09T11:00:00Z'); // 23 hours before
    const result = calculateRefund(rules, appointmentTime, cancelTime);
    expect(result.percentage).toBe(0);
  });

  it('should return 0% if no rules are defined', () => {
    const appointmentTime = new Date('2026-04-10T10:00:00Z');
    const cancelTime = new Date('2026-04-08T09:00:00Z');
    const result = calculateRefund([], appointmentTime, cancelTime);
    expect(result.percentage).toBe(0);
  });

  it('should handle rules out of order', () => {
    const messyRules = [
      { hoursBefore: 48, percentage: 100 },
      { hoursBefore: 24, percentage: 50 }
    ];
    const appointmentTime = new Date('2026-04-10T10:00:00Z');
    const cancelTime = new Date('2026-04-09T09:00:00Z'); // 25 hours before
    const result = calculateRefund(messyRules, appointmentTime, cancelTime);
    expect(result.percentage).toBe(50);
  });
});
