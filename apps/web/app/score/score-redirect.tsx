'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function ScoreRedirect() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) router.replace(`/score/${address}`);
  }, [isConnected, address, router]);

  return null;
}
