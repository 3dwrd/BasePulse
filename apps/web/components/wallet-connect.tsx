'use client';

import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { useEffect, useState } from 'react';
import { getBaseAccountSDK, defaultChain } from '@/lib/wagmi';

interface MeResponse {
  address: string | null;
  chainId: number | null;
}

export function WalletConnect() {
  const [me, setMe] = useState<MeResponse>({ address: null, chainId: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => {});
  }, []);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const { nonce } = await fetch('/api/auth/nonce', { cache: 'no-store' }).then((r) => r.json());
      const provider = getBaseAccountSDK().getProvider();
      const chainIdHex = `0x${defaultChain.id.toString(16)}`;
      const result = (await provider.request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: { signInWithEthereum: { nonce, chainId: chainIdHex } },
          },
        ],
      })) as {
        accounts: {
          address: `0x${string}`;
          capabilities: {
            signInWithEthereum: { message: string; signature: `0x${string}` };
          };
        }[];
      };
      const acc = result.accounts[0];
      const { message, signature } = acc.capabilities.signInWithEthereum;
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address: acc.address, message, signature, chainId: defaultChain.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Verification failed');
      const data = await res.json();
      setMe({ address: data.address, chainId: defaultChain.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe({ address: null, chainId: null });
    setBusy(false);
  }

  if (me.address) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="font-mono">{me.address.slice(0, 6)}…{me.address.slice(-4)}</span>
        <button
          onClick={signOut}
          disabled={busy}
          className="rounded border border-neutral-300 px-3 py-1 hover:bg-neutral-100 disabled:opacity-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <SignInWithBaseButton colorScheme="light" variant="solid" onClick={signIn} />
      {error && <span className="text-xs text-red-600">{error}</span>}
      {busy && <span className="text-xs text-neutral-500">Signing in…</span>}
    </div>
  );
}
