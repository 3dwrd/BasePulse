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
