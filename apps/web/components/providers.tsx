'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import type { Config } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { buildWagmiConfig } from '@/lib/wagmi';

export function Providers({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setConfig(buildWagmiConfig());
  }, []);

  if (!config) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
