'use client';

import { createBaseAccountSDK } from '@base-org/account';
import { Attribution } from 'ox/erc8021';
import { custom, http } from 'viem';
import { createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN === 'base' ? base : baseSepolia;

// Real Base Builder Code (registered at dashboard.base.org), ERC-8021 attribution.
// Set at the wagmi client level so useWriteContract/useSendTransaction/useSendCalls
// all carry it automatically — see .agents/skills/adding-builder-codes/references/wagmi.md.
// Unrelated to PortfolioSnapshot's own `BUILDER_CODE` bytes8 constant (a tag the
// contract itself stores, not something Base's indexer reads).
const BUILDER_CODE_DATA_SUFFIX = Attribution.toDataSuffix({ codes: ['bc_bo6g6vzn'] });

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
    dataSuffix: BUILDER_CODE_DATA_SUFFIX,
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
    dataSuffix: BUILDER_CODE_DATA_SUFFIX,
    transports: {
      [base.id]: custom(provider),
      [baseSepolia.id]: custom(provider),
    },
  });
}

export { defaultChain };
