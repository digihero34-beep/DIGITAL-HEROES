import { cache } from 'react';
import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import {
  AuthUser,
  UnauthorizedError,
  ForbiddenError,
  SubscriptionRequiredError,
} from './auth-types';

/**
 * Returns the currently authenticated user with their profile role, or null if unauthenticated.
 * Memoized per-request using React.cache to eliminate redundant remote network calls.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch profile to get role and display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? undefined,
    role: (profile?.role as AuthUser['role']) ?? 'subscriber',
  };
});

/**
 * Guard: Requires that the user is authenticated. Throws UnauthorizedError if not.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError('You must be logged in to perform this action.');
  }
  return user;
}

/**
 * Guard: Requires that the user is authenticated with the 'admin' role. Throws ForbiddenError if not.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new ForbiddenError('Administrative privileges are required for this action.');
  }
  return user;
}

/**
 * Guard: Requires that the user has an active membership subscription.
 */
export async function requireActiveSubscription(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single();

  if (!sub || sub.status !== 'active') {
    throw new SubscriptionRequiredError('An active membership is required to access this feature.');
  }
}
