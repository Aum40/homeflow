'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavItems, isNavItemActive } from './nav-items';

export default function BottomNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-outline-variant bg-surface-container-low lg:hidden">
      {navItems.map((item) => {
        const isActive = item.enabled && isNavItemActive(pathname, item);
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={item.enabled ? undefined : (e) => e.preventDefault()}
            aria-disabled={!item.enabled}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 px-1 py-2.5 transition-colors',
              isActive
                ? 'font-bold text-primary'
                : item.enabled
                  ? 'text-on-surface-variant'
                  : 'cursor-not-allowed text-outline'
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="text-center text-[10px] leading-tight">
              {item.shortLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
