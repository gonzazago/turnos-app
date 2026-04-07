export interface RefundRule {
  hoursBefore: number;
  percentage: number;
}

/**
 * Calculates the refund percentage based on how far in advance the cancellation is made.
 * 
 * @param rules - List of refund rules set by the provider
 * @param appointmentTime - The start time of the appointment
 * @param cancelTime - The time the cancellation is requested (defaults to now)
 * @returns An object containing the percentage to refund
 */
export function calculateRefund(
  rules: RefundRule[],
  appointmentTime: Date,
  cancelTime: Date = new Date()
): { percentage: number } {
  if (!rules || rules.length === 0) {
    return { percentage: 0 };
  }

  // Calculate hours between now and the appointment
  const diffInMs = appointmentTime.getTime() - cancelTime.getTime();
  const hoursBefore = diffInMs / (1000 * 60 * 60);

  if (hoursBefore < 0) {
    return { percentage: 0 }; // Appointment already passed or is too close
  }

  // Sort rules by hoursBefore descending to find the highest matching tier
  const sortedRules = [...rules].sort((a, b) => b.hoursBefore - a.hoursBefore);

  let appliedPercentage = 0;

  for (const rule of sortedRules) {
    if (hoursBefore >= rule.hoursBefore) {
      appliedPercentage = rule.percentage;
      break; // Found the highest tier that matches
    }
  }

  return { percentage: appliedPercentage };
}
