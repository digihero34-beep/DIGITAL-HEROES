import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { subscriptionService } from '@/modules/subscriptions/subscription-service';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid signature';
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Enforce idempotency via PostgreSQL ledger
  const isNewEvent = await subscriptionService.recordWebhookEvent(
    event.id,
    event.type,
    event as unknown as Record<string, unknown>
  );

  if (!isNewEvent) {
    // Duplicate webhook received: acknowledge safely without reprocessing
    return NextResponse.json(
      { received: true, duplicate: true },
      { status: 200 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await subscriptionService.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.updated':
        await subscriptionService.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await subscriptionService.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_failed':
        await subscriptionService.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice
        );
        break;

      default:
        // Other events can be safely acknowledged
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Processing error';
    return NextResponse.json(
      { error: `Webhook processing error: ${message}` },
      { status: 500 }
    );
  }
}
