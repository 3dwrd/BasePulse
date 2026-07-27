import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { NavSidebar } from '@/components/nav-sidebar';
import { WalletConnect } from '@/components/wallet-connect';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'BasePulse',
  description: 'Portfolio, gas, and onchain score for Base.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
  other: { 'base:app_id': '6a668e04281b6db318994d46' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="grid min-h-screen grid-rows-[auto_1fr]">
            <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
              <a href="/" className="text-lg font-semibold tracking-tight">
                Base<span className="text-base-blue">Pulse</span>
              </a>
              <WalletConnect />
            </header>
            <div className="grid grid-cols-[200px_1fr]">
              <aside className="border-r border-neutral-200 dark:border-neutral-800">
                <NavSidebar />
              </aside>
              <main className="p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
