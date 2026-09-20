interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cacheMap = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | undefined {
  const entry = cacheMap.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cacheMap.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlSeconds = 60): void {
  cacheMap.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    cacheMap.clear();
    return;
  }
  for (const key of cacheMap.keys()) {
    if (key.startsWith(keyPrefix)) {
      cacheMap.delete(key);
    }
  }
}
