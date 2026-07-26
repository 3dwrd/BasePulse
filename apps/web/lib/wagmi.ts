'use client';

import { createBaseAccountSDK } from '@base-org/account';
import { custom, http } from 'viem';
import { createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN === 'base' ? base : baseSepolia;

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null;

export function getBaseAccountSDK() {
  if (typeof window === 'undefined') {
    throw new Error('Base Account SDK only runs in the browser');
  }
  if (!sdkInstance) {
    sdkInstance = createBaseAccountSDK({
      appName: 'BasePulse',
      appChainIds: [base.id, baseSepolia.id],
    });
  }
  return sdkInstance;
}

// SSR/pre-mount config: public RPC transport, no `window` dependency. Wagmi
// hooks (useAccount, etc.) require a WagmiProvider ancestor to exist on every
// render pass including SSR, so this keeps that context satisfied (reporting
// "disconnected") until buildWagmiConfig() swaps in the real wallet provider
// on the client.
export function buildFallbackWagmiConfig() {
  return createConfig({
    chains: [base, baseSepolia],
    ssr: true,
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

export function buildWagmiConfig() {
  const provider = getBaseAccountSDK().getProvider();
  return createConfig({
    chains: [base, baseSepolia],
    ssr: true,
    transports: {
      [base.id]: custom(provider),
      [baseSepolia.id]: custom(provider),
    },
  });
}

export { defaultChain };
