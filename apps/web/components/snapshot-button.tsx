'use client';

import { useMemo } from 'react';
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import {
  BUILDER_CODE,
  PORTFOLIO_SNAPSHOT_ABI,
  portfolioSnapshotAddress,
} from '@/lib/contracts/portfolio-snapshot';

interface Token {
  address: `0x${string}`;
  symbol: string;
  balance: string;
}

interface Props {
  tokens: Token[];
}

function fingerprintTokens(tokens: Token[]): `0x${string}` {
  const canonical = tokens
    .map((t) => `${t.address.toLowerCase()}:${t.symbol}:${t.balance}`)
    .sort()
    .join('|');
  return keccak256(stringToBytes(canonical));
}

export function SnapshotButton({ tokens }: Props) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = portfolioSnapshotAddress(chainId);

  const fingerprint = useMemo(() => fingerprintTokens(tokens), [tokens]);

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (!isConnected) return null;

  if (!contractAddress) {
    return (
      <p className="text-xs text-neutral-500">
        Snapshot contract not configured for chain {chainId}. Deploy via{' '}
        <code>contracts/script/DeployPortfolioSnapshot.s.sol</code> and set{' '}
        <code>NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_ADDRESS_*</code>.
      </p>
    );
  }

  const disabled = isPending || isMining || tokens.length === 0;

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          writeContract({
            address: contractAddress,
            abi: PORTFOLIO_SNAPSHOT_ABI,
            functionName: 'record',
            args: [fingerprint, BUILDER_CODE],
          })
        }
        className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        {isPending ? 'Confirm in wallet…' : isMining ? 'Mining…' : 'Snapshot onchain'}
      </button>
      {txHash && (
        <p className="text-xs text-neutral-500">
          tx:{' '}
          <span className="font-mono">
            {txHash.slice(0, 10)}…{txHash.slice(-8)}
          </span>{' '}
          {isSuccess ? '· confirmed ✓' : isMining ? '· pending' : ''}
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
