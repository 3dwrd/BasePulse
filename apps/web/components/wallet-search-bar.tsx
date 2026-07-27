'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { isAddress } from 'viem';

export function WalletSearchBar() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const address = value.trim();
    if (!isAddress(address)) {
      setError('Enter a valid 0x… wallet address');
      return;
    }
    setError(null);
    router.push(`/score/${address}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0x… — check any wallet's Base score"
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        Check score
      </button>
    </form>
  );
}
