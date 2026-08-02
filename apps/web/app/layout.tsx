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
  other: {
    // Back to the July id: after the duplicate app created on 2026-08-02 was cleaned
    // up, the Base Dashboard settled on this one as the app to verify. The short-lived
    // second id was 6a6f93a5a8c4f2b6db3b3e11 — do not resurrect it.
    'base:app_id': '6a668e04281b6db318994d46',
    'talentapp:project_verification':
      'bac8161fc45cd56aa349b689a2e78da8da83612bf6209026f4053c11640120a062536764fa16f5797687abc843719eb92959571865703b042989224839dc2f7a',
  },
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
