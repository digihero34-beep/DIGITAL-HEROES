'use server';

import { requireAuth, getCurrentUser } from '@/modules/auth/server-guards';
import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { stripe } from '@/lib/stripe';
import { ActionResult } from '@/modules/auth/auth-actions';
import {
  Charity,
  CharityEvent,
  UserCharityPreference,
  DirectDonationInput,
  DirectDonationResult,
} from './charity-types';
import {
  validateContributionPercentage,
  validateDonationAmount,
  filterCharities,
} from './charity-validation';

interface CharityRow {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url: string;
  banner_url?: string | null;
  website_url?: string | null;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  events: unknown;
  created_at: string;
  updated_at: string;
}

function mapCharityRow(row: CharityRow): Charity {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    websiteUrl: row.website_url,
    category: row.category,
    isFeatured: row.is_featured,
    isActive: row.is_active,
    events: Array.isArray(row.events) ? (row.events as CharityEvent[]) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

import { getCached, setCached } from '@/lib/memory-cache';

export async function getCharitiesAction(params?: {
  query?: string;
  category?: string;
}): Promise<ActionResult<Charity[]>> {
  try {
    const cacheKey = 'charities_all_active';
    let charities = getCached<Charity[]>(cacheKey);

    if (!charities) {
      const supabase = await createServerSupabaseClient();

      const { data: rows, error } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true);

      if (error || !rows) {
        return { success: false, error: error?.message || 'Failed to load charities.', code: 'QUERY_FAILED' };
      }

      charities = (rows as unknown as CharityRow[]).map(mapCharityRow);
      setCached(cacheKey, charities, 120); // 2 minutes in-memory cache
    }

    const filtered = filterCharities(charities, params?.query, params?.category);

    return { success: true, data: filtered };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to query charities.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}

export async function getCharityBySlugAction(slug: string): Promise<ActionResult<Charity | null>> {
  try {
    // Check in-memory list first for instant 0ms resolution
    const cachedList = getCached<Charity[]>('charities_all_active');
    if (cachedList) {
      const found = cachedList.find((c) => c.slug === slug);
      if (found) return { success: true, data: found };
    }

    const supabase = await createServerSupabaseClient();

    const { data: row, error } = await supabase
      .from('charities')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !row) {
      return { success: true, data: null };
    }

    return { success: true, data: mapCharityRow(row as unknown as CharityRow) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load charity details.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}

export async function getUserCharityPreferenceAction(): Promise<
  ActionResult<UserCharityPreference | null>
> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data: row, error } = await supabase
      .from('user_charity_preferences')
      .select('id, user_id, charity_id, contribution_percentage, created_at, updated_at, charities(*)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !row) {
      return { success: true, data: null };
    }

    const charityData = row.charities ? mapCharityRow(row.charities as unknown as CharityRow) : undefined;

    return {
      success: true,
      data: {
        id: row.id,
        userId: row.user_id,
        charityId: row.charity_id,
        contributionPercentage: row.contribution_percentage,
        charity: charityData,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load charity preference.';
    return { success: false, error: message, code: 'PREFERENCE_ERROR' };
  }
}

export async function updateCharityPreferenceAction(params: {
  charityId: string;
  contributionPercentage: number;
}): Promise<ActionResult<UserCharityPreference>> {
  try {
    const user = await requireAuth();

    // 1. Enforce minimum 10% lock (PRD § 08)
    const validation = validateContributionPercentage(params.contributionPercentage);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid contribution percentage.',
        code: 'INVALID_PERCENTAGE',
      };
    }

    // 2. Verify charity exists and is active
    const { data: charity, error: charityError } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('id', params.charityId)
      .eq('is_active', true)
      .single();

    if (charityError || !charity) {
      return { success: false, error: 'Charity partner not found or inactive.', code: 'NOT_FOUND' };
    }

    // 3. Upsert preference
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('user_charity_preferences')
      .upsert(
        {
          user_id: user.id,
          charity_id: params.charityId,
          contribution_percentage: params.contributionPercentage,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (upsertError || !upserted) {
      return {
        success: false,
        error: upsertError?.message || 'Failed to update charity preference.',
        code: 'UPSERT_FAILED',
      };
    }

    return {
      success: true,
      data: {
        id: upserted.id,
        userId: upserted.user_id,
        charityId: upserted.charity_id,
        contributionPercentage: upserted.contribution_percentage,
        charity: mapCharityRow(charity as unknown as CharityRow),
        createdAt: upserted.created_at,
        updatedAt: upserted.updated_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save charity preference.';
    return { success: false, error: message, code: 'UPDATE_ERROR' };
  }
}

export async function createDirectDonationAction(
  input: DirectDonationInput
): Promise<ActionResult<DirectDonationResult>> {
  try {
    // 1. Validate donation amount
    const val = validateDonationAmount(input.amountCents);
    if (!val.isValid) {
      return { success: false, error: val.error || 'Invalid amount', code: 'INVALID_AMOUNT' };
    }

    // 2. Verify charity
    const { data: charity, error: charityError } = await supabaseAdmin
      .from('charities')
      .select('id, name')
      .eq('id', input.charityId)
      .eq('is_active', true)
      .single();

    if (charityError || !charity) {
      return { success: false, error: 'Selected charity not found.', code: 'NOT_FOUND' };
    }

    // Optional user context
    const currentUser = await getCurrentUser();

    // 3. Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: 'gbp',
      description: `Direct charitable donation to ${charity.name}`,
      metadata: {
        charityId: input.charityId,
        charityName: charity.name,
        donorName: input.donorName || 'Anonymous',
        donorEmail: input.donorEmail || '',
        userId: currentUser?.id || '',
      },
    });

    if (!paymentIntent.client_secret) {
      return { success: false, error: 'Failed to initialize payment.', code: 'GATEWAY_ERROR' };
    }

    // 4. Record pending donation in public.charity_donations
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('charity_donations')
      .insert({
        charity_id: input.charityId,
        user_id: currentUser?.id || null,
        amount_cents: input.amountCents,
        currency: 'GBP',
        stripe_payment_intent_id: paymentIntent.id,
        donor_name: input.donorName || 'Anonymous Supporter',
        donor_email: input.donorEmail || null,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      return { success: false, error: 'Failed to record donation.', code: 'RECORD_FAILED' };
    }

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        donationId: inserted.id,
        amountCents: input.amountCents,
        currency: 'GBP',
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Donation initialization failed.';
    return { success: false, error: message, code: 'DONATION_ERROR' };
  }
}
