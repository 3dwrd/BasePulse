import { NextResponse } from 'next/server';
import { createPublicClient, http, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { consumeNonce } from '@/lib/nonce-store';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

interface VerifyBody {
  address: Address;
  message: string;
  signature: `0x${string}`;
  chainId: number;
}

function clientForChain(chainId: number) {
  if (chainId === base.id) return createPublicClient({ chain: base, transport: http() });
  if (chainId === baseSepolia.id) return createPublicClient({ chain: baseSepolia, transport: http() });
  return null;
}

export async function POST(req: Request) {
  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { address, message, signature, chainId } = body;
  if (!address || !message || !signature || !chainId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const nonceMatch = message.match(/Nonce: (\w+)/);
  if (!nonceMatch || !consumeNonce(nonceMatch[1])) {
    return NextResponse.json({ error: 'Invalid or reused nonce' }, { status: 401 });
  }

  const client = clientForChain(chainId);
  if (!client) {
    return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
  }

  const valid = await client.verifyMessage({ address, message, signature });
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const session = await getSession();
  session.address = address;
  session.chainId = chainId;
  session.issuedAt = Date.now();
  await session.save();

  return NextResponse.json({ ok: true, address });
}
