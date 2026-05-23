import { base, baseSepolia } from 'wagmi/chains';

export const PORTFOLIO_SNAPSHOT_ABI = [
  {
    type: 'function',
    name: 'record',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'fingerprint', type: 'bytes32' },
      { name: 'builderCode', type: 'bytes8' },
    ],
    outputs: [{ name: 'index', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'snapshotCount',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'SnapshotRecorded',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'index', type: 'uint256', indexed: true },
      { name: 'fingerprint', type: 'bytes32', indexed: false },
      { name: 'timestamp', type: 'uint64', indexed: false },
      { name: 'builderCode', type: 'bytes8', indexed: false },
    ],
  },
  { type: 'error', name: 'EmptyFingerprint', inputs: [] },
] as const;

// 8-byte ASCII "BASEPULS" — placeholder Base Builder attribution tag.
// Replace with the real BuilderCode once registered with Base.
export const BUILDER_CODE: `0x${string}` = '0x4241534550554c53';

export function portfolioSnapshotAddress(chainId: number): `0x${string}` | null {
  const sepolia = process.env.NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_ADDRESS_SEPOLIA as
    | `0x${string}`
    | undefined;
  const mainnet = process.env.NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_ADDRESS_MAINNET as
    | `0x${string}`
    | undefined;
  if (chainId === baseSepolia.id) return sepolia ?? null;
  if (chainId === base.id) return mainnet ?? null;
  return null;
}
