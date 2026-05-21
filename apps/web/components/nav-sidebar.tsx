import Link from 'next/link';
import { Wallet, Fuel, Trophy } from 'lucide-react';

const items = [
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/gas', label: 'Gas', icon: Fuel },
  { href: '/score', label: 'Score', icon: Trophy },
];

export function NavSidebar() {
  return (
    <nav className="flex flex-col gap-1 p-4 text-sm">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-2 rounded px-3 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
