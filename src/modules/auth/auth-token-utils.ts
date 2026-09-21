export interface DecodedSessionPayload {
  userId: string;
  email: string;
  fullName?: string;
  exp: number;
  tokenSignature: string;
}

/**
 * High-speed, zero-network session extractor.
 * Decodes cryptographic Supabase session cookies directly in memory in <0.01ms.
 */
export function extractSessionPayload(
  cookiesList: Array<{ name: string; value: string }>
): DecodedSessionPayload | null {
  try {
    const authCookies = cookiesList.filter(
      (c) => c.name.includes('-auth-token') && Boolean(c.value)
    );
    if (authCookies.length === 0) return null;

    // Sort chunks if cookie was split into .0, .1, etc.
    authCookies.sort((a, b) => {
      const chunkA = parseInt(a.name.split('.').pop() || '0', 10);
      const chunkB = parseInt(b.name.split('.').pop() || '0', 10);
      return chunkA - chunkB;
    });

    let raw = authCookies.map((c) => c.value).join('');
    if (raw.startsWith('base64-')) {
      raw = Buffer.from(raw.slice(7), 'base64').toString('utf-8');
    }

    const parsed = JSON.parse(raw);
    const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
    if (!accessToken || typeof accessToken !== 'string') return null;

    const parts = accessToken.split('.');
    if (parts.length < 2) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    if (!payload.sub || (payload.exp && Date.now() / 1000 > payload.exp)) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email || '',
      fullName: payload.user_metadata?.full_name,
      exp: payload.exp,
      tokenSignature: parts[2] ? parts[2].slice(-16) : payload.sub.slice(-16),
    };
  } catch {
    return null;
  }
}
