'use client';

import { createBaseAccountSDK } from '@base-org/account';
import { custom } from 'viem';
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

export function buildWagmiConfig() {
  const provider = getBaseAccountSDK().getProvider();
  return createConfig({
    chains: [base, baseSepolia],
    transports: {
      [base.id]: custom(provider),
      [baseSepolia.id]: custom(provider),
    },
  });
}

export { defaultChain };
