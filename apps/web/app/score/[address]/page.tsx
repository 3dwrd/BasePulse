import { notFound } from 'next/navigation';
import { isAddress } from 'viem';
import type { Metadata } from 'next';
import { getScore, type DerivedScore } from '@/lib/cache-client';

const DEFAULT_CHAIN = 8453;

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export async function generateMetadata(
  { params }: { params: Promise<{ address: string }> },
): Promise<Metadata> {
  const { address } = await params;
  if (!isAddress(address)) return {};
  const title = `BasePulse score — ${short(address)}`;
  const description = 'Onchain reputation snapshot on Base.';
  const ogUrl = `/score/${address}/opengraph-image`;
  return {
    title,
    description,
    openGraph: { title, description, images: [ogUrl], url: `/score/${address}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': ogUrl,
    },
  };
}

function tierColor(tier: DerivedScore['tier']): string {
  return {
    novice: 'bg-neutral-500',
    active: 'bg-blue-500',
    engaged: 'bg-violet-500',
    power: 'bg-emerald-500',
  }[tier];
}

export default async function ScoreAddressPage(
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  if (!isAddress(address)) notFound();

  let score: DerivedScore | null = null;
  let error: string | null = null;
  try {
    score = await getScore(DEFAULT_CHAIN, address);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load score';
  }

  if (error || !score) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Score unavailable</h1>
        <p className="text-sm text-neutral-500">{error ?? 'No data'}</p>
      </div>
    );
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/score/${address}`;
  const shareText = `BasePulse score: ${score.total}/100`;
  const farcasterIntent = `https://warpcast.com/~/compose?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-neutral-500">{short(address)}</p>
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-semibold tabular-nums">{score.total}</h1>
          <span className="text-neutral-500">/ 100</span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium text-white ${tierColor(score.tier)}`}
          >
            {score.tier}
          </span>
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Breakdown
        </h2>
        <ul className="space-y-2">
          {score.components.map((c) => (
            <li key={c.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{c.label}</span>
                <span className="tabular-nums text-neutral-500">
                  {c.points} / {c.max}
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-800">
                <div
                  className="h-full rounded bg-neutral-900 dark:bg-neutral-100"
                  style={{ width: `${(c.points / c.max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {score.recommendations.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            What&apos;s missing
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {score.recommendations.map((r) => (
              <li key={r.id}>{r.label}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex gap-2">
        <a
          href={farcasterIntent}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Share on Farcaster
        </a>
        <a
          href={xIntent}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Share on X
        </a>
      </section>
    </div>
  );
}
