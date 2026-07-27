import { env, USE_MOCK_DATA } from './env.js';

export interface TokenBalance {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logo: string | null;
}

const CHAIN_TO_ALCHEMY = {
  8453: 'base-mainnet',
  84532: 'base-sepolia',
} as const;

type SupportedChain = keyof typeof CHAIN_TO_ALCHEMY;

export function isSupportedChain(id: number): id is SupportedChain {
  return id in CHAIN_TO_ALCHEMY;
}

interface JsonRpcResponse<T> {
  result?: T;
  error?: { code: number; message: string };
}

/**
 * Alchemy answers JSON-RPC-level failures (network not enabled for the app,
 * bad key, rate limit) with HTTP 200 and an `error` member, so `res.ok` alone
 * is not enough — without this check `result` is undefined and the caller
 * blows up on a property access instead of surfacing Alchemy's message.
 */
async function alchemyCall<T>(
  url: string,
  method: string,
  params: unknown[],
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });

  if (!res.ok) throw new Error(`Alchemy ${method} HTTP ${res.status}`);

  const json = (await res.json()) as JsonRpcResponse<T>;
  if (json.error) throw new Error(`Alchemy ${method}: ${json.error.message}`);
  if (json.result === undefined) throw new Error(`Alchemy ${method}: empty result`);

  return json.result;
}

export async function fetchTokenBalances(
  chainId: SupportedChain,
  address: `0x${string}`,
): Promise<TokenBalance[]> {
  if (USE_MOCK_DATA) return mockBalances(address);

  const network = CHAIN_TO_ALCHEMY[chainId];
  const url = `https://${network}.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;

  const balances = await alchemyCall<{
    tokenBalances: { contractAddress: `0x${string}`; tokenBalance: string }[];
  }>(url, 'alchemy_getTokenBalances', [address]);

  const nonZero = balances.tokenBalances.filter(
    (t) => t.tokenBalance && t.tokenBalance !== '0x0' && t.tokenBalance !== '0x',
  );

  const metadata = await Promise.all(
    nonZero.map(async (t) => {
      // One bad token's metadata must not sink the whole portfolio.
      const meta = await alchemyCall<{
        symbol: string | null;
        name: string | null;
        decimals: number | null;
        logo: string | null;
      }>(url, 'alchemy_getTokenMetadata', [t.contractAddress]).catch(() => null);
      if (!meta) return null;
      return {
        address: t.contractAddress,
        symbol: meta.symbol ?? 'UNK',
        name: meta.name ?? 'Unknown',
        decimals: meta.decimals ?? 18,
        balance: BigInt(t.tokenBalance).toString(),
        logo: meta.logo,
      } satisfies TokenBalance;
    }),
  );

  return metadata.filter((x): x is TokenBalance => x !== null);
}

function mockBalances(address: `0x${string}`): TokenBalance[] {
  return [
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      balance: '1234560000',
      logo: null,
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      balance: '500000000000000000',
      logo: null,
    },
    {
      address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
      symbol: 'AERO',
      name: 'Aerodrome',
      decimals: 18,
      balance: '750000000000000000000',
      logo: null,
    },
  ];
}
