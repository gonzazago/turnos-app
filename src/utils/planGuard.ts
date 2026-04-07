export type PlanType = 'free' | 'pro' | 'ultra'
export interface TierLimits {
  maxEventTypes: number;
}

const LIMITS: Record<PlanType, TierLimits> = {
  free: { maxEventTypes: 1 },
  pro: { maxEventTypes: -1 }, // -1 means unlimited
  ultra: { maxEventTypes: -1 },
}

export function hasProAccess(plan: PlanType): boolean {
  return plan === 'pro' || plan === 'ultra'
}

export function hasUltraAccess(plan: PlanType): boolean {
  return plan === 'ultra'
}

export function canCreateEventType(plan: PlanType, currentCount: number): boolean {
  const limit = LIMITS[plan].maxEventTypes;
  if (limit === -1) return true;
  return currentCount < limit;
}
