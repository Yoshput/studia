/**
 * High-Performance In-Memory Client Cache with SWR (Stale-While-Revalidate)
 * Ensures 0ms instantaneous page transitions across Studia features.
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

export async function fetchWithCache<T = any>(
  url: string,
  options?: RequestInit,
  maxAgeMs = 45000 // 45 seconds cache validity
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(url);

  // If cached and fresh, return immediately (0ms latency)
  if (cached && now - cached.timestamp < maxAgeMs) {
    // Background revalidation if older than half maxAge
    if (now - cached.timestamp > maxAgeMs / 2) {
      fetch(url, options)
        .then((res) => (res.ok ? res.json() : null))
        .then((freshData) => {
          if (freshData) {
            memoryCache.set(url, { data: freshData, timestamp: Date.now() });
          }
        })
        .catch(() => {});
    }
    return cached.data;
  }

  // Not in memory, fetch from network
  const res = await fetch(url, options);
  if (!res.ok) {
    // If network fails but stale cache exists, return stale cache as fallback
    if (cached) return cached.data;
    throw new Error(`Fetch failed with status ${res.status}`);
  }

  const data = await res.json();
  memoryCache.set(url, { data, timestamp: Date.now() });
  return data;
}

export function getCachedData<T = any>(url: string): T | null {
  const cached = memoryCache.get(url);
  return cached ? cached.data : null;
}

export function invalidateClientCache(urlPrefix?: string) {
  if (!urlPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      memoryCache.delete(key);
    }
  }
}

