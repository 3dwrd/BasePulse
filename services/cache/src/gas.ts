import { redis } from './redis.js';

const CHAIN_RPC = {
  8453: 'https://mainnet.base.org',
  84532: 'https://sepolia.base.org',
} as const;

type SupportedGasChain = keyof typeof CHAIN_RPC;

export function isSupportedGasChain(id: number): id is SupportedGasChain {
  return id in CHAIN_RPC;
}

export interface GasSample {
  t: number;
  gwei: number;
}

export type GasRecommendation = 'low' | 'normal' | 'high' | 'unknown';

export interface GasStats {
  p25: number;
  p50: number;
  p75: number;
  count: number;
}

export interface GasCurrent {
  chainId: SupportedGasChain;
  gwei: number;
  fetchedAt: number;
  recommendation: GasRecommendation;
  stats: GasStats | null;
}

export interface GasHistory {
  chainId: SupportedGasChain;
  samples: GasSample[];
  stats: GasStats | null;
  fetchedAt: number;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const WEI_PER_GWEI = 1_000_000_000n;

function samplesKey(chainId: SupportedGasChain): string {
  return `gas:${chainId}:samples`;
}

export async function fetchCurrentGasGwei(chainId: SupportedGasChain): Promise<number> {
  const res = await fetch(CHAIN_RPC[chainId], {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] }),
  });
  if (!res.ok) throw new Error(`RPC ${chainId} ${res.status}`);
  const json = (await res.json()) as { result?: string; error?: { message: string } };
  if (!json.result) throw new Error(`RPC ${chainId} no result: ${json.error?.message ?? 'unknown'}`);
  const wei = BigInt(json.result);
  return Number((wei * 10000n) / WEI_PER_GWEI) / 10000;
}

export async function recordSample(chainId: SupportedGasChain, sample: GasSample): Promise<void> {
  const key = samplesKey(chainId);
  await redis.zadd(key, sample.t, `${sample.t}:${sample.gwei}`);
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  await redis.zremrangebyscore(key, '-inf', cutoff);
}

export async function readSamples(chainId: SupportedGasChain): Promise<GasSample[]> {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const raw = await redis.zrangebyscore(samplesKey(chainId), cutoff, '+inf');
  const samples: GasSample[] = [];
  for (const member of raw) {
    const idx = member.indexOf(':');
    if (idx === -1) continue;
    const t = Number(member.slice(0, idx));
    const gwei = Number(member.slice(idx + 1));
    if (Number.isFinite(t) && Number.isFinite(gwei)) samples.push({ t, gwei });
  }
  return samples;
}

export function computeStats(samples: GasSample[]): GasStats | null {
  if (samples.length === 0) return null;
  const sorted = samples.map((s) => s.gwei).sort((a, b) => a - b);
  return {
    p25: percentile(sorted, 0.25),
    p50: percentile(sorted, 0.5),
    p75: percentile(sorted, 0.75),
    count: sorted.length,
  };
}

function percentile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 1) return sortedAsc[0];
  const pos = (sortedAsc.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (pos - lo);
}

export function classify(currentGwei: number, stats: GasStats | null): GasRecommendation {
  if (!stats || stats.count < 5) return 'unknown';
  if (currentGwei <= stats.p25) return 'low';
  if (currentGwei >= stats.p75) return 'high';
  return 'normal';
}

let samplerHandle: NodeJS.Timeout | null = null;

export function startSampler(chainIds: SupportedGasChain[], intervalMs = 60_000): void {
  if (samplerHandle) return;
  const tick = async () => {
    for (const chainId of chainIds) {
      try {
        const gwei = await fetchCurrentGasGwei(chainId);
        await recordSample(chainId, { t: Date.now(), gwei });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[gas-sampler] ${chainId} failed:`, msg);
      }
    }
  };
  void tick();
  samplerHandle = setInterval(tick, intervalMs);
}

export const SUPPORTED_GAS_CHAINS: SupportedGasChain[] = [8453, 84532];
