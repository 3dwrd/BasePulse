'use client';

import { createBaseAccountSDK } from '@base-org/account';
import { Attribution } from 'ox/erc8021';
import { http } from 'viem';
import { createConfig } from 'wagmi';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { base, baseSepolia } from 'wagmi/chains';

const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN === 'base' ? base : baseSepolia;

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Other EVM wallets alongside Base Account (MetaMask/Rainbow/Trust/Brave all show up
// via `injected()` — any EIP-1193 wallet extension does). `walletConnect()` needs a
// project id from cloud.reown.com (free) for mobile QR pairing; omitted entirely
// when unset instead of failing at runtime with an empty projectId.
const otherWalletConnectors = [
  injected(),
  coinbaseWallet({ appName: 'BasePulse' }),
  ...(walletConnectProjectId ? [walletConnect({ projectId: walletConnectProjectId })] : []),
];

// Real Base Builder Code (registered at dashboard.base.org), ERC-8021 attribution.
// Unrelated to PortfolioSnapshot's own `BUILDER_CODE` bytes8 constant (a tag the
// contract itself stores, not something Base's indexer reads).
//
// WARNING: `createConfig({ dataSuffix })` below is IGNORED by @wagmi/core 3.4.12 — the key
// exists in no runtime path and no type there. The first real mainnet snapshot
// (0x09cb992c…2c60, block 49447791) landed with 68 bytes of calldata and no suffix at all,
// i.e. unattributed. Callers must pass `dataSuffix` per transaction; wagmi spreads unknown
// params into viem's writeContract → sendTransaction, which does the `concat(data, suffix)`.
// Keep the config key for whenever wagmi supports it, but never rely on it alone.
export const BUILDER_CODE_DATA_SUFFIX = Attribution.toDataSuffix({ codes: ['bc_bo6g6vzn'] });

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
  return createConfig({
    chains: [base, baseSepolia],
    ssr: true,
    dataSuffix: BUILDER_CODE_DATA_SUFFIX,
    connectors: otherWalletConnectors,
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

export { defaultChain };
