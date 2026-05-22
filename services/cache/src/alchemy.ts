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

export async function fetchTokenBalances(
  chainId: SupportedChain,
  address: `0x${string}`,
): Promise<TokenBalance[]> {
  if (USE_MOCK_DATA) return mockBalances(address);

  const network = CHAIN_TO_ALCHEMY[chainId];
  const url = `https://${network}.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;

  const balancesRes = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getTokenBalances',
      params: [address],
    }),
  });

  if (!balancesRes.ok) throw new Error(`Alchemy balances ${balancesRes.status}`);
  const balancesJson = (await balancesRes.json()) as {
    result: { tokenBalances: { contractAddress: `0x${string}`; tokenBalance: string }[] };
  };

  const nonZero = balancesJson.result.tokenBalances.filter(
    (t) => t.tokenBalance && t.tokenBalance !== '0x0' && t.tokenBalance !== '0x',
  );

  const metadata = await Promise.all(
    nonZero.map(async (t) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenMetadata',
          params: [t.contractAddress],
        }),
      });
      if (!res.ok) return null;
      const meta = (await res.json()) as {
        result: { symbol: string | null; name: string | null; decimals: number | null; logo: string | null };
      };
      return {
        address: t.contractAddress,
        symbol: meta.result.symbol ?? 'UNK',
        name: meta.result.name ?? 'Unknown',
        decimals: meta.result.decimals ?? 18,
        balance: BigInt(t.tokenBalance).toString(),
        logo: meta.result.logo,
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
