import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import { getCached, setCached } from '@/lib/memory-cache';
import {
  AuthUser,
  UnauthorizedError,
  ForbiddenError,
  SubscriptionRequiredError,
} from './auth-types';

/**
 * Returns the currently authenticated user with their profile role, or null if unauthenticated.
 * Uses high-speed process-level in-memory caching to eliminate redundant remote network calls.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find((c) => c.name.includes('-auth-token') && c.value);

  if (!authCookie) {
    return null;
  }

  // 1. Fast process-level in-memory cache
  const cacheKey = `auth_user:${authCookie.value.slice(-32)}`;
  const cachedUser = getCached<AuthUser>(cacheKey);
  if (cachedUser) {
    return cachedUser;
  }

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

  const authUser: AuthUser = {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? undefined,
    role: (profile?.role as AuthUser['role']) ?? 'subscriber',
  };

  // Cache authenticated user identity for 30 seconds
  setCached(cacheKey, authUser, 30);
  return authUser;
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
