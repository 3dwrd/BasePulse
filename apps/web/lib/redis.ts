import 'server-only';
import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var __basepulseRedis: Redis | undefined;
}

export function getRedis(): Redis {
  if (!globalThis.__basepulseRedis) {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    globalThis.__basepulseRedis = new Redis(url, {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
  }
  return globalThis.__basepulseRedis;
}
