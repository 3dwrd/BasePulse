'use client';

import { useMemo } from 'react';
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
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

function explorerTxUrl(chainId: number, hash: `0x${string}`): string {
  const host = chainId === baseSepolia.id ? 'sepolia.basescan.org' : 'basescan.org';
  return `https://${host}/tx/${hash}`;
}

/**
 * Renders in every state — including signed-out. An anonymous visitor has to be able to see
 * that the app writes onchain at all, otherwise the action is invisible and never converts.
 */
export function SnapshotButton({ tokens }: Props) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = portfolioSnapshotAddress(chainId);

  const fingerprint = useMemo(() => fingerprintTokens(tokens), [tokens]);

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const unsupportedChain = isConnected && !contractAddress;
  const disabled = !isConnected || unsupportedChain || isPending || isMining;

  const label = isPending
    ? 'Confirm in wallet…'
    : isMining
      ? 'Recording onchain…'
      : isSuccess
        ? 'Seal another snapshot'
        : 'Seal snapshot';

  return (
    <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h2 className="text-sm font-semibold">Seal this portfolio onchain</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Writes a fingerprint of these holdings to Base — verifiable proof of what you held today,
        that you can point to later. Costs a fraction of a cent in gas. Your balances stay private:
        only a hash goes onchain, never the amounts.
      </p>

      <div className="mt-3 space-y-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            writeContract({
              address: contractAddress as `0x${string}`,
              abi: PORTFOLIO_SNAPSHOT_ABI,
              functionName: 'record',
              args: [fingerprint, BUILDER_CODE],
            })
          }
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {label}
        </button>

        {!isConnected && (
          <p className="text-xs text-neutral-500">
            Connect a wallet to seal a snapshot — takes one transaction on Base.
          </p>
        )}

        {unsupportedChain && (
          <p className="text-xs text-amber-600">
            Unsupported network. Switch to Base mainnet or Base Sepolia to record a snapshot.
          </p>
        )}

        {isConnected && !unsupportedChain && tokens.length === 0 && (
          <p className="text-xs text-neutral-500">
            No ERC-20 balances found on this network — you can still seal an empty snapshot as a
            timestamped record.
          </p>
        )}

        {txHash && (
          <p className="text-xs text-neutral-500">
            {isSuccess ? 'Recorded onchain ✓ ' : isMining ? 'Pending… ' : ''}
            <a
              href={explorerTxUrl(chainId, txHash)}
              target="_blank"
              rel="noreferrer"
              className="font-mono underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </a>
          </p>
        )}

        {error && <p className="text-xs text-red-600">{error.message}</p>}
      </div>
    </section>
  );
}
