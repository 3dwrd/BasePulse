'use client';

import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { useEffect, useState } from 'react';
import { SiweMessage } from 'siwe';
import type { Address } from 'viem';
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { getBaseAccountSDK, defaultChain } from '@/lib/wagmi';

interface MeResponse {
  address: string | null;
  chainId: number | null;
}

const SUPPORTED_CHAIN_IDS = [base.id, baseSepolia.id] as const;

async function fetchNonce(): Promise<string> {
  const { nonce } = await fetch('/api/auth/nonce', { cache: 'no-store' }).then((r) => r.json());
  return nonce;
}

async function verify(address: Address, message: string, signature: `0x${string}`, chainId: number) {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address, message, signature, chainId }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Verification failed');
  return (await res.json()) as { address: Address };
}

export function WalletConnect() {
  const [me, setMe] = useState<MeResponse>({ address: null, chainId: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => {});
  }, []);

  // Base Account's own `wallet_connect` capability bundles nonce + SIWE signature in
  // one prompt — left untouched, unrelated to the generic wagmi connector flow below.
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
      const data = await verify(acc.address, message, signature, defaultChain.id);
      setMe({ address: data.address, chainId: defaultChain.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  // Generic path for any other EVM wallet (MetaMask, Rainbow, Trust, Coinbase Wallet
  // extension, WalletConnect-paired mobile wallets, ...): connect via the wagmi
  // connector, build a standard EIP-4361 message ourselves, sign it, then reuse the
  // same `/api/auth/verify` endpoint — it already verifies via `viem.verifyMessage`
  // and doesn't care which wallet produced the signature.
  async function signInWithConnector(connectorId: string) {
    setBusy(true);
    setError(null);
    try {
      const connector = connectors.find((c) => c.id === connectorId);
      if (!connector) throw new Error('Wallet not available');

      const connectResult = await connectAsync({ connector });
      const address = connectResult.accounts[0];
      let chainId = connectResult.chainId;

      if (!SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number])) {
        try {
          const switched = await switchChainAsync({ connector, chainId: defaultChain.id });
          chainId = switched.id;
        } catch {
          throw new Error(`Switch your wallet to ${defaultChain.name} and try again`);
        }
      }

      const nonce = await fetchNonce();
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to BasePulse.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
      const message = siweMessage.prepareMessage();
      const signature = await signMessageAsync({ account: address, message });
      const data = await verify(address, message, signature, chainId);
      setMe({ address: data.address, chainId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
      disconnect();
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    disconnect();
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
    <div className="flex flex-col items-end gap-2">
      <SignInWithBaseButton colorScheme="light" variant="solid" onClick={signIn} />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-xs text-neutral-500">or</span>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => signInWithConnector(connector.id)}
            disabled={busy}
            className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50"
          >
            {connector.name}
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {busy && <span className="text-xs text-neutral-500">Signing in…</span>}
    </div>
  );
}
