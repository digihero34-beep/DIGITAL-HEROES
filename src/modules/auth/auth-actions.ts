'use server';

import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import { z } from 'zod';
import { AuthUser } from './auth-types';

const UUID_FORMAT_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const SignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(150),
  charityId: z.string().regex(UUID_FORMAT_REGEX, 'Invalid charity ID').optional().or(z.literal('')),
  contributionPercentage: z.number().int().min(10).max(100).default(10),
});

const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export async function signUpAction(formData: z.infer<typeof SignUpSchema>): Promise<ActionResult<{ userId: string }>> {
  const parsed = SignUpSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Failed to create account.', code: 'SIGNUP_FAILED' };
  }

  // Save charity preference if provided
  if (parsed.data.charityId) {
    await supabase.from('user_charity_preferences').upsert({
      user_id: data.user.id,
      charity_id: parsed.data.charityId,
      contribution_percentage: parsed.data.contributionPercentage,
    });
  }

  return { success: true, data: { userId: data.user.id } };
}

export async function signInAction(formData: z.infer<typeof SignInSchema>): Promise<ActionResult<{ user: AuthUser }>> {
  const parsed = SignInSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { success: false, error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single();

  return {
    success: true,
    data: {
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        fullName: profile?.full_name ?? undefined,
        role: (profile?.role as AuthUser['role']) ?? 'subscriber',
      },
    },
  };
}

export async function signOutAction(): Promise<ActionResult<void>> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error: error.message, code: 'SIGNOUT_FAILED' };
  }
  return { success: true, data: undefined };
}
