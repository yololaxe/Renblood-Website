const memoryCache = new Map();

export const buildCacheKey = (type, key = "default") => `${type}:${key}`;

export const readCache = (type, key = "default") => {
  return memoryCache.get(buildCacheKey(type, key));
};

export const writeCache = (type, value, key = "default") => {
  memoryCache.set(buildCacheKey(type, key), value);
  return value;
};

export const clearCache = (type, key = null) => {
  if (key === null) {
    const prefix = `${type}:`;
    for (const cacheKey of Array.from(memoryCache.keys())) {
      if (cacheKey.startsWith(prefix)) memoryCache.delete(cacheKey);
    }
    return;
  }

  memoryCache.delete(buildCacheKey(type, key));
};

export const getCacheSnapshot = () => Object.fromEntries(memoryCache.entries());
export default memoryCache;
