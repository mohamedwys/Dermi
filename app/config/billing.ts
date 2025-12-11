/**
 * Billing Configuration
 *
 * Centralized billing plan configuration for Shopify App Store.
 * Pricing can be overridden via environment variables for different environments.
 */

export interface BillingPlan {
  name: string;
  amount: number;
  currencyCode: string;
  interval: "EVERY_30_DAYS" | "ANNUAL";
  trialDays: number;
}

/**
 * Billing plan definitions
 * Amounts can be overridden via environment variables:
 * - STARTER_PLAN_PRICE (default: 25.00)
 * - PROFESSIONAL_PLAN_PRICE (default: 79.00)
 */
export const BILLING_PLANS = {
  STARTER: {
    name: "Starter Plan",
    amount: parseFloat(process.env.STARTER_PLAN_PRICE || "25.0"),
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
  },
  PROFESSIONAL: {
    name: "Professional Plan",
    amount: parseFloat(process.env.PROFESSIONAL_PLAN_PRICE || "79.0"),
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
  },
} as const satisfies Record<string, BillingPlan>;

/**
 * Get all plan names for billing API
 */
export const PLAN_NAMES = [
  BILLING_PLANS.STARTER.name,
  BILLING_PLANS.PROFESSIONAL.name,
] as const;

/**
 * Validate if a plan name is valid
 */
export function isValidPlanName(planName: string): boolean {
  return PLAN_NAMES.includes(planName as any);
}

/**
 * Get billing plan by name
 */
export function getBillingPlan(planName: string): BillingPlan | null {
  const plan = Object.values(BILLING_PLANS).find(p => p.name === planName);
  return plan || null;
}
