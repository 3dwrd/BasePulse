import { env, USE_MOCK_DATA } from './env.js';
import { fetchTokenBalances, isSupportedChain } from './alchemy.js';

export interface ScoreBreakdown {
  baseTxCount: number;
  l1TxCount: number;
  tokenDiversity: number;
  bridged: boolean;
}

export interface ScoreRecommendation {
  id: string;
  label: string;
  weight: number;
}

export interface DerivedScore {
  address: `0x${string}`;
  chainId: number;
  total: number;
  tier: 'novice' | 'active' | 'engaged' | 'power';
  breakdown: ScoreBreakdown;
  components: { id: string; label: string; points: number; max: number }[];
  recommendations: ScoreRecommendation[];
  source: 'derived';
  fetchedAt: number;
}

const BASE_RPC = 'https://mainnet.base.org';
const L1_RPC = 'https://cloudflare-eth.com';

async function ethTxCount(rpc: string, address: string): Promise<number> {
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
      }),
    });
    if (!res.ok) return 0;
    const json = (await res.json()) as { result?: string };
    return json.result ? parseInt(json.result, 16) : 0;
  } catch {
    return 0;
  }
}

function clamp(n: number, max: number): number {
  return Math.max(0, Math.min(max, n));
}

export async function computeScore(
  chainId: number,
  address: `0x${string}`,
): Promise<DerivedScore> {
  let baseTxCount = 0;
  let l1TxCount = 0;
  let tokenDiversity = 0;

  if (USE_MOCK_DATA) {
    baseTxCount = 42;
    l1TxCount = 7;
    tokenDiversity = 3;
  } else {
    const [baseN, l1N, tokens] = await Promise.all([
      ethTxCount(BASE_RPC, address),
      ethTxCount(L1_RPC, address),
      isSupportedChain(chainId) ? fetchTokenBalances(chainId, address) : Promise.resolve([]),
    ]);
    baseTxCount = baseN;
    l1TxCount = l1N;
    tokenDiversity = tokens.length;
  }

  const bridged = false; // v1: not detected; surfaced as recommendation

  const txPts = clamp(Math.round(Math.log10(baseTxCount + 1) * 15), 40);
  const diversityPts = clamp(Math.min(tokenDiversity, 5) * 4, 20);
  const l1Pts = clamp(Math.round(Math.log10(l1TxCount + 1) * 10), 20);
  const bridgePts = bridged ? 20 : 0;
  const total = txPts + diversityPts + l1Pts + bridgePts;

  const tier: DerivedScore['tier'] =
    total >= 75 ? 'power' : total >= 50 ? 'engaged' : total >= 25 ? 'active' : 'novice';

  const components = [
    { id: 'base-activity', label: 'Base activity', points: txPts, max: 40 },
    { id: 'token-diversity', label: 'Token diversity', points: diversityPts, max: 20 },
    { id: 'l1-history', label: 'L1 history', points: l1Pts, max: 20 },
    { id: 'bridging', label: 'Bridging', points: bridgePts, max: 20 },
  ];

  const recommendations: ScoreRecommendation[] = [];
  if (txPts < 30) {
    recommendations.push({
      id: 'more-base-tx',
      label: 'Increase Base activity — swap, mint, or interact with a protocol',
      weight: 40 - txPts,
    });
  }
  if (diversityPts < 16) {
    recommendations.push({
      id: 'hold-more-tokens',
      label: `Hold at least 5 different tokens (currently ${tokenDiversity})`,
      weight: 20 - diversityPts,
    });
  }
  if (l1Pts < 10) {
    recommendations.push({
      id: 'l1-presence',
      label: 'Build some Ethereum L1 history with this wallet',
      weight: 20 - l1Pts,
    });
  }
  if (!bridged) {
    recommendations.push({
      id: 'bridge',
      label: 'Bridge assets from Ethereum or another L2 to Base',
      weight: 20,
    });
  }
  recommendations.sort((a, b) => b.weight - a.weight);

  return {
    address,
    chainId,
    total,
    tier,
    breakdown: { baseTxCount, l1TxCount, tokenDiversity, bridged },
    components,
    recommendations,
    source: 'derived',
    fetchedAt: Date.now(),
  };
}
