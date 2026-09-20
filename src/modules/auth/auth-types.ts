export type UserRole = 'public' | 'subscriber' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

export class AuthError extends Error {
  constructor(message: string, public code: string = 'AUTH_ERROR', public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = 'Authentication required.') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = 'Administrative privileges required.') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class SubscriptionRequiredError extends AuthError {
  constructor(message: string = 'Active membership required to access this feature.') {
    super(message, 'SUBSCRIPTION_REQUIRED', 403);
    this.name = 'SubscriptionRequiredError';
  }
}
