import { NextResponse } from 'next/server';
import { getGasCurrent, getGasHistory } from '@/lib/cache-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORTED = new Set([8453, 84532]);

export async function GET(_req: Request, ctx: { params: Promise<{ chainId: string }> }) {
  const { chainId: chainIdRaw } = await ctx.params;
  const chainId = Number(chainIdRaw);
  if (!SUPPORTED.has(chainId)) {
    return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
  }

  try {
    const [current, history] = await Promise.all([
      getGasCurrent(chainId),
      getGasHistory(chainId),
    ]);
    return NextResponse.json({ current, history });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
