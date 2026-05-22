import 'server-only';

export interface CachedTokens {
  tokens: {
    address: `0x${string}`;
    symbol: string;
    name: string;
    decimals: number;
    balance: string;
    logo: string | null;
  }[];
  fetchedAt: number;
}

function config() {
  const baseUrl = process.env.CACHE_SERVICE_URL ?? 'http://localhost:4000';
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN not configured');
  return { baseUrl, token };
}

export async function getTokens(chainId: number, address: string): Promise<CachedTokens> {
  const { baseUrl, token } = config();
  const res = await fetch(`${baseUrl}/v1/tokens/${chainId}/${address}`, {
    headers: { 'x-internal-token': token },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`cache service ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<CachedTokens>;
}

export type GasRecommendation = 'low' | 'normal' | 'high' | 'unknown';

export interface GasStats {
  p25: number;
  p50: number;
  p75: number;
  count: number;
}

export interface GasCurrent {
  chainId: number;
  gwei: number;
  fetchedAt: number;
  recommendation: GasRecommendation;
  stats: GasStats | null;
}

export interface GasSample {
  t: number;
  gwei: number;
}

export interface GasHistory {
  chainId: number;
  samples: GasSample[];
  stats: GasStats | null;
  fetchedAt: number;
}

async function getFromCache<T>(path: string): Promise<T> {
  const { baseUrl, token } = config();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'x-internal-token': token },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`cache service ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export function getGasCurrent(chainId: number): Promise<GasCurrent> {
  return getFromCache<GasCurrent>(`/v1/gas/${chainId}/current`);
}

export function getGasHistory(chainId: number): Promise<GasHistory> {
  return getFromCache<GasHistory>(`/v1/gas/${chainId}/history`);
}
