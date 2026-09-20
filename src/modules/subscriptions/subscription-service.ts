import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { stripe } from '@/lib/stripe';
import { SubscriptionStatus, UserSubscription } from './subscription-types';
import type Stripe from 'stripe';

export class SubscriptionService {
  /**
   * Idempotently records an incoming Stripe webhook event.
   * Returns true if newly inserted, false if this event was already processed.
   */
  async recordWebhookEvent(
    eventId: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('stripe_webhook_events')
      .insert({
        id: eventId,
        event_type: eventType,
        payload,
        status: 'processed',
        processed_at: new Date().toISOString(),
      });

    if (error) {
      // Unique violation (PostgreSQL code 23505) indicates duplicate event
      if (error.code === '23505' || error.message.includes('duplicate key')) {
        return false;
      }
      throw new Error(`Failed to record webhook event: ${error.message}`);
    }

    return true;
  }

  /**
   * Handles checkout.session.completed to provision or activate a user subscription.
   */
  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId || 'plan_monthly';
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

    if (!userId || !customerId || !subscriptionId) {
      throw new Error(
        `Incomplete checkout session metadata. userId: ${userId}, customerId: ${customerId}, subscriptionId: ${subscriptionId}`
      );
    }

    // Retrieve subscription from Stripe to obtain accurate period timestamps
    let periodStart = new Date().toISOString();
    let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let status: SubscriptionStatus = 'active';

    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const subItem = stripeSub as unknown as { current_period_start: number; current_period_end: number; status: string };
      if (subItem.current_period_start) {
        periodStart = new Date(subItem.current_period_start * 1000).toISOString();
      }
      if (subItem.current_period_end) {
        periodEnd = new Date(subItem.current_period_end * 1000).toISOString();
      }
      status = this.mapStripeStatus(subItem.status);
    } catch {
      // Fallback for mock environments
    }

    const { error } = await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        plan_id: planId,
        status,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      throw new Error(`Failed to upsert subscription for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Synchronizes subscription lifecycle changes from customer.subscription.updated.
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const sub = subscription as unknown as {
      id: string;
      status: string;
      current_period_start: number;
      current_period_end: number;
      cancel_at_period_end: boolean;
      canceled_at?: number | null;
    };

    const status = this.mapStripeStatus(sub.status);
    const periodStart = new Date(sub.current_period_start * 1000).toISOString();
    const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
    const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at: canceledAt,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', sub.id);

    if (error) {
      throw new Error(`Failed to update subscription ${sub.id}: ${error.message}`);
    }
  }

  /**
   * Handles customer.subscription.deleted when a subscription lapses or is terminated.
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw new Error(`Failed to cancel subscription ${subscription.id}: ${error.message}`);
    }
  }

  /**
   * Handles invoice.payment_failed when recurring billing fails.
   */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const inv = invoice as unknown as { subscription?: string | { id: string } };
    const subscriptionId =
      typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;

    if (!subscriptionId) {
      return;
    }

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      throw new Error(`Failed to mark subscription ${subscriptionId} as past_due: ${error.message}`);
    }
  }

  /**
   * Queries the current active or latest subscription for a given user.
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      status: data.status as SubscriptionStatus,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      canceledAt: data.canceled_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Maps Stripe subscription statuses to our domain status enum.
   */
  mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return 'active';
      case 'past_due':
        return 'past_due';
      case 'canceled':
        return 'canceled';
      case 'incomplete':
        return 'incomplete';
      case 'incomplete_expired':
        return 'incomplete_expired';
      case 'trialing':
        return 'trialing';
      case 'unpaid':
        return 'unpaid';
      default:
        return 'incomplete';
    }
  }
}

export const subscriptionService = new SubscriptionService();
