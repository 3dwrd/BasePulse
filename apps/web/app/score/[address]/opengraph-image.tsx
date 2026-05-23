import { ImageResponse } from 'next/og';
import { isAddress } from 'viem';
import { getScore } from '@/lib/cache-client';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };
export const alt = 'BasePulse score';

const DEFAULT_CHAIN = 8453;

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const TIER_BG: Record<string, string> = {
  novice: '#525252',
  active: '#3b82f6',
  engaged: '#8b5cf6',
  power: '#10b981',
};

export default async function OG({ params }: { params: { address: string } }) {
  const { address } = params;
  if (!isAddress(address)) {
    return new ImageResponse(<div style={{ fontSize: 48 }}>Invalid address</div>, size);
  }

  let total = 0;
  let tier: keyof typeof TIER_BG = 'novice';
  try {
    const s = await getScore(DEFAULT_CHAIN, address);
    total = s.total;
    tier = s.tier;
  } catch {
    // render placeholder
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          color: '#fafafa',
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, opacity: 0.7 }}>
          <span>BasePulse</span>
          <span>{short(address)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <span style={{ fontSize: 280, fontWeight: 700, lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 48, opacity: 0.5 }}>/ 100</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              background: TIER_BG[tier],
              color: '#fff',
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 28,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            {tier}
          </span>
          <span style={{ fontSize: 24, opacity: 0.6 }}>Onchain score · Base</span>
        </div>
      </div>
    ),
    size,
  );
}
