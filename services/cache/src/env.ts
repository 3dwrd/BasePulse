import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  PORT: Number(optional('CACHE_PORT', '4000')),
  REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),
  INTERNAL_API_TOKEN: required('INTERNAL_API_TOKEN'),
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY ?? '',
  NODE_ENV: optional('NODE_ENV', 'development'),
};

export const USE_MOCK_DATA = !env.ALCHEMY_API_KEY;
