'use server';

import { requireAuth } from '@/modules/auth/server-guards';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { ActionResult } from '@/modules/auth/auth-actions';
import { UserSubscription } from './subscription-types';

interface PlanConfig {
  name: string;
  amountCents: number;
  interval: 'month' | 'year';
}

const PLANS: Record<'plan_monthly' | 'plan_yearly', PlanConfig> = {
  plan_monthly: {
    name: 'Digital Heroes Monthly Membership',
    amountCents: 2000,
    interval: 'month',
  },
  plan_yearly: {
    name: 'Digital Heroes Annual Membership (20% Discount)',
    amountCents: 19200,
    interval: 'year',
  },
};

export async function createCheckoutSessionAction(
  planId: 'plan_monthly' | 'plan_yearly'
): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireAuth();
    const plan = PLANS[planId];

    if (!plan) {
      return { success: false, error: 'Invalid subscription plan selected.', code: 'INVALID_PLAN' };
    }

    // Check if user already has an established Stripe customer ID
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: plan.name,
              description:
                'Includes score tracking, monthly draw participation, and guaranteed charity contribution.',
            },
            unit_amount: plan.amountCents,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
      },
      success_url: `${env.siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/pricing`,
    });

    if (!session.url) {
      return { success: false, error: 'Failed to generate checkout session URL.', code: 'CHECKOUT_FAILED' };
    }

    return { success: true, data: { url: session.url } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initialize checkout.';
    return { success: false, error: message, code: 'CHECKOUT_ERROR' };
  }
}

export async function createCustomerPortalAction(): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireAuth();

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return { success: false, error: 'No active billing record found.', code: 'NO_CUSTOMER_FOUND' };
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${env.siteUrl}/dashboard`,
    });

    return { success: true, data: { url: portal.url } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to open customer portal.';
    return { success: false, error: message, code: 'PORTAL_ERROR' };
  }
}

export async function getUserSubscriptionAction(): Promise<ActionResult<UserSubscription | null>> {
  try {
    const user = await requireAuth();

    const { data: row, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message, code: 'FETCH_ERROR' };
    }

    if (!row) {
      return { success: true, data: null };
    }

    const sub: UserSubscription = {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      canceledAt: row.canceled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return { success: true, data: sub };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve subscription.';
    return { success: false, error: message, code: 'SUB_ERROR' };
  }
}
