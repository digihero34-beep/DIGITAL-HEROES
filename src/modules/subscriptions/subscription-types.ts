export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export type PlanInterval = 'month' | 'year';

export interface Plan {
  id: string;
  name: string;
  interval: PlanInterval;
  amount_cents: number;
  currency: string;
  stripe_price_id: string;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResult {
  url: string;
}

export interface CustomerPortalResult {
  url: string;
}
