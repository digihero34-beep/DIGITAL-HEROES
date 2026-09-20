import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { getCached, setCached } from '@/lib/memory-cache';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Fast-path: completely bypass remote auth calls for public routes
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/scores') ||
    pathname.startsWith('/winnings');

  if (!isProtected) {
    return NextResponse.next();
  }

  // 2. Ultra-fast Cookie Gate: if no auth cookie exists, reject immediately with ZERO network latency
  const authCookie = request.cookies
    .getAll()
    .find((c) => c.name.includes('-auth-token') && Boolean(c.value));

  if (!authCookie) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname !== '/admin/login') {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // 3. Ultra-fast Process Cache check (0.01ms resolution)
  const tokenKey = authCookie.value.slice(-32);
  const cachedAuth = getCached<{ id: string; role: string }>(`mw_auth:${tokenKey}`);

  if (cachedAuth) {
    if (pathname === '/admin/login') {
      if (cachedAuth.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith('/admin')) {
      if (cachedAuth.role !== 'admin') {
        return NextResponse.redirect(
          new URL('/dashboard?error=admin_privileges_required', request.url)
        );
      }
    }

    return NextResponse.next();
  }

  // 4. Cache miss: perform authenticated session refresh with Supabase
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname !== '/admin/login') {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Fetch role for admin verification
  let role = 'subscriber';
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role) {
    role = profile.role;
  }

  // Cache in process memory for 60 seconds
  setCached(`mw_auth:${tokenKey}`, { id: user.id, role }, 60);

  if (pathname === '/admin/login') {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(
        new URL('/dashboard?error=admin_privileges_required', request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
