import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { getScore } from '@/lib/cache-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_CHAIN = 8453;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ address: string }> },
) {
  const { address } = await ctx.params;
  if (!isAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }
  try {
    const data = await getScore(DEFAULT_CHAIN, address);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
