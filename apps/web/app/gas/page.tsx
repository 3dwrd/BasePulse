'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  GasCurrent,
  GasHistory,
  GasRecommendation,
} from '@/lib/cache-client';

const DEFAULT_CHAIN_ID = 8453;

interface GasResponse {
  current: GasCurrent;
  history: GasHistory;
}

async function fetchGas(chainId: number): Promise<GasResponse> {
  const res = await fetch(`/api/gas/${chainId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load gas');
  return res.json();
}

const BADGE_STYLES: Record<GasRecommendation, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  normal: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  unknown: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

const BADGE_LABEL: Record<GasRecommendation, string> = {
  low: 'Good time to transact',
  normal: 'Normal gas',
  high: 'Gas is high — wait if you can',
  unknown: 'Building history…',
};

export default function GasPage() {
  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['gas', DEFAULT_CHAIN_ID],
    queryFn: () => fetchGas(DEFAULT_CHAIN_ID),
    retry: false,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gas</h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 disabled:opacity-50"
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isLoading && <div className="h-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />}
      {error && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      {data && (
        <>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold tabular-nums">{data.current.gwei.toFixed(4)}</span>
              <span className="text-sm text-neutral-500">gwei · Base mainnet</span>
            </div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${BADGE_STYLES[data.current.recommendation]}`}
            >
              {BADGE_LABEL[data.current.recommendation]}
            </span>
          </div>

          <Sparkline samples={data.history.samples} />

          {data.current.stats ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat label="p25 (7d)" value={`${data.current.stats.p25.toFixed(4)} gwei`} />
              <Stat label="p50 (7d)" value={`${data.current.stats.p50.toFixed(4)} gwei`} />
              <Stat label="p75 (7d)" value={`${data.current.stats.p75.toFixed(4)} gwei`} />
            </div>
          ) : (
            <p className="text-xs text-neutral-500">No history yet — sampler needs ~5 minutes to build a baseline.</p>
          )}

          <p className="text-xs text-neutral-500">
            Updated {new Date(data.current.fetchedAt).toLocaleTimeString()} · {data.history.samples.length} samples in 7d
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  );
}

function Sparkline({ samples }: { samples: { t: number; gwei: number }[] }) {
  const width = 600;
  const height = 120;
  const padding = 8;

  if (samples.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center rounded border border-dashed border-neutral-300 text-xs text-neutral-500 dark:border-neutral-700">
        Need at least 2 samples to draw a chart.
      </div>
    );
  }

  const sorted = [...samples].sort((a, b) => a.t - b.t);
  const ts = sorted.map((s) => s.t);
  const ys = sorted.map((s) => s.gwei);
  const tMin = ts[0];
  const tMax = ts[ts.length - 1];
  const tSpan = Math.max(1, tMax - tMin);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const ySpan = Math.max(1e-9, yMax - yMin);

  const points = sorted.map((s) => {
    const x = padding + ((s.t - tMin) / tSpan) * (width - 2 * padding);
    const y = padding + (1 - (s.gwei - yMin) / ySpan) * (height - 2 * padding);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const path = `M ${points.join(' L ')}`;

  return (
    <div className="rounded border border-neutral-200 p-3 dark:border-neutral-800">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-blue-600" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
        <span>{new Date(tMin).toLocaleString()}</span>
        <span>{yMin.toFixed(4)}–{yMax.toFixed(4)} gwei</span>
        <span>{new Date(tMax).toLocaleString()}</span>
      </div>
    </div>
  );
}
