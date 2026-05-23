'use client';

import { useQuery } from '@tanstack/react-query';
import { formatBalance } from '@/lib/format';
import { SnapshotButton } from '@/components/snapshot-button';

interface PortfolioResponse {
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

async function fetchPortfolio(): Promise<PortfolioResponse> {
  const res = await fetch('/api/portfolio', { cache: 'no-store' });
  if (res.status === 401) throw new Error('Sign in to view your portfolio.');
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load portfolio');
  return res.json();
}

export default function PortfolioPage() {
  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    retry: false,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio</h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 disabled:opacity-50"
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      {data && (
        <>
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500 dark:border-neutral-800">
              <tr>
                <th className="py-2">Token</th>
                <th className="py-2">Balance</th>
                <th className="py-2 text-right">Address</th>
              </tr>
            </thead>
            <tbody>
              {data.tokens.map((t) => (
                <tr key={t.address} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="py-3">
                    <div className="font-medium">{t.symbol}</div>
                    <div className="text-xs text-neutral-500">{t.name}</div>
                  </td>
                  <td className="py-3 font-mono">{formatBalance(t.balance, t.decimals)}</td>
                  <td className="py-3 text-right font-mono text-xs text-neutral-500">
                    {t.address.slice(0, 6)}…{t.address.slice(-4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-neutral-500">
            Fetched {new Date(data.fetchedAt).toLocaleTimeString()} · {data.tokens.length} tokens
          </p>
          <SnapshotButton tokens={data.tokens} />
        </>
      )}
    </div>
  );
}
